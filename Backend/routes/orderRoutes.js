import express from 'express';
import auth from '../middleware/auth.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { createNotification } from '../utils/notifications.js';
import mongoose from 'mongoose';
import process from 'process';

const router = express.Router();

// مسارات الاختبار
router.get('/test', (req, res) => {
    res.json({ 
        message: 'مسار الطلبات يعمل',
        timestamp: new Date().toISOString()
    });
});

// مسار لاختبار التوثيق
router.get('/test-auth', auth, (req, res) => {
    res.json({ 
        message: 'تم التحقق من التوثيق بنجاح',
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    });
});

// مسار لاختبار الاتصال بقاعدة البيانات
router.get('/test-db', async (req, res) => {
    try {
        const ordersCount = await Order.countDocuments();
        const productsCount = await Product.countDocuments();
        
        res.json({
            message: 'تم الاتصال بقاعدة البيانات بنجاح',
            stats: {
                orders: ordersCount,
                products: productsCount
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'فشل الاتصال بقاعدة البيانات',
            error: error.message
        });
    }
});

// إنشاء طلب جديد
router.post('/', auth, async (req, res) => {
    try {
        console.log('=== بداية معالجة الطلب ===');
        console.log('بيانات الطلب المستلمة:', JSON.stringify(req.body, null, 2));
        console.log('بيانات المستخدم المصادق:', JSON.stringify(req.user, null, 2));
        
        const { product: productId, quantity, totalPrice, shippingDetails } = req.body;
        
        // التحقق من البيانات المطلوبة
        if (!productId || !quantity || !totalPrice || !shippingDetails) {
            console.log('بيانات مفقودة:', { productId, quantity, totalPrice, shippingDetails });
            return res.status(400).json({
                success: false,
                message: 'جميع الحقول مطلوبة'
            });
        }

        // التحقق من صحة القيم العددية
        const numericQuantity = Number(quantity);
        const numericPrice = Number(totalPrice);

        if (isNaN(numericQuantity) || numericQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'الكمية يجب أن تكون رقماً موجباً'
            });
        }

        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'السعر يجب أن يكون رقماً موجباً'
            });
        }

        // التحقق من تفاصيل الشحن
        const { fullName, phone, address, city } = shippingDetails;
        if (!fullName?.trim() || !phone?.trim() || !address?.trim() || !city?.trim()) {
            console.log('تفاصيل شحن غير مكتملة:', shippingDetails);
            return res.status(400).json({
                success: false,
                message: 'جميع تفاصيل الشحن مطلوبة'
            });
        }

        // التحقق من صحة رقم الهاتف
        const phoneRegex = /^01[0125][0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'رقم الهاتف غير صحيح'
            });
        }

        // جلب المنتج مع معلومات البائع
        console.log('جلب المنتج:', productId);
        const productDoc = await Product.findById(productId).populate('seller');
        
        if (!productDoc) {
            console.log('المنتج غير موجود:', productId);
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // التحقق من أن المشتري ليس هو البائع
        if (productDoc.seller._id.toString() === req.user._id.toString()) {
            console.log('محاولة شراء منتج خاص:', {
                seller: productDoc.seller._id,
                buyer: req.user._id
            });
            return res.status(400).json({
                success: false,
                message: 'لا يمكنك شراء منتجاتك'
            });
        }

        // التحقق من الكمية المتوفرة
        if (productDoc.quantity < numericQuantity) {
            console.log('الكمية غير متوفرة:', {
                requested: numericQuantity,
                available: productDoc.quantity
            });
            return res.status(400).json({
                success: false,
                message: 'الكمية المطلوبة غير متوفرة',
                available: productDoc.quantity
            });
        }

        // التحقق من السعر
        const expectedPrice = productDoc.price * numericQuantity;
        if (Math.abs(expectedPrice - numericPrice) > 0.01) {
            console.log('السعر غير صحيح:', {
                sent: numericPrice,
                expected: expectedPrice
            });
            return res.status(400).json({
                success: false,
                message: 'السعر غير صحيح',
                expectedPrice
            });
        }

        // إنشاء الطلب
        const order = new Order({
            product: productId,
            seller: productDoc.seller._id,
            buyer: req.user._id,
            quantity: numericQuantity,
            totalPrice: numericPrice,
            shippingDetails: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                address: address.trim(),
                city: city.trim(),
                notes: shippingDetails.notes?.trim() || ''
            }
        });

        // حفظ الطلب وتحديث كمية المنتج في معاملة واحدة
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            console.log('محاولة حفظ الطلب:', JSON.stringify(order.toJSON(), null, 2));
            await order.save({ session });
            
            await Product.findByIdAndUpdate(
                productId,
                { $inc: { quantity: -numericQuantity } },
                { session, new: true }
            );

            // إنشاء إشعار للبائع
            await createNotification({
                recipient: productDoc.seller._id,
                from: req.user.id,
                type: 'order',
                message: `لديك طلب جديد من ${fullName}`,
                order: order._id
            });

            await session.commitTransaction();
            console.log('تم حفظ الطلب وتحديث المنتج بنجاح');

            // جلب الطلب مع البيانات المرتبطة
            const populatedOrder = await Order.findById(order._id)
                .populate('product')
                .populate('buyer', 'name profileImage')
                .populate('seller', 'name profileImage');

            res.status(201).json({
                success: true,
                message: 'تم إنشاء الطلب بنجاح',
                data: populatedOrder
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('خطأ في إنشاء الطلب:', error);
        console.error('تفاصيل الخطأ:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // معالجة أخطاء التحقق من Mongoose
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'خطأ في التحقق من البيانات',
                errors
            });
        }

        // معالجة أخطاء المعرف غير الصالح
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'معرف غير صالح',
                field: error.path
            });
        }

        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء الطلب',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                type: error.name,
                details: error.errors || error.error || error
            } : undefined
        });
    }
});

// الحصول على طلبات المستخدم
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate('product')
            .populate('buyer', 'name profileImage')
            .populate('seller', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// الحصول على الطلبات الواردة للبائع
router.get('/seller-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ seller: req.user._id })
            .populate('product')
            .populate('buyer', 'name profileImage')
            .populate('seller', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// تحديث حالة الطلب
router.put('/:orderId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.orderId;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        // التحقق من أن المستخدم هو البائع
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتحديث هذا الطلب'
            });
        }

        order.status = status;
        await order.save();

        // إنشاء إشعار للمشتري
        await createNotification({
            recipient: order.buyer,
            type: 'order_status_update',
            title: 'تحديث حالة الطلب',
            message: `تم تحديث حالة طلبك إلى ${status}`,
            data: {
                orderId: order._id,
                status
            }
        });

        const updatedOrder = await Order.findById(orderId)
            .populate('product')
            .populate('buyer', 'name profileImage')
            .populate('seller', 'name profileImage');

        res.json({
            success: true,
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// جلب عدد الطلبات الجديدة
router.get('/new-count', auth, async (req, res) => {
    try {
        const count = await Order.countDocuments({
            seller: req.user.id,
            status: 'pending'
        });

        res.json({
            success: true,
            data: count
        });
    } catch (error) {
        console.error('Get new orders count error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get new orders count'
        });
    }
});

export default router;