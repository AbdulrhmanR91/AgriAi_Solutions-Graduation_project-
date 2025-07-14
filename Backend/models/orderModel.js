import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'المنتج مطلوب']
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'البائع مطلوب']
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'المشتري مطلوب']
    },
    quantity: {
        type: Number,
        required: [true, 'الكمية مطلوبة'],
        min: [1, 'الكمية يجب أن تكون أكبر من صفر']
    },
    totalPrice: {
        type: Number,
        required: [true, 'السعر الإجمالي مطلوب'],
        min: [0, 'السعر الإجمالي يجب أن يكون أكبر من أو يساوي صفر']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            message: 'حالة الطلب غير صالحة'
        },
        default: 'pending'
    },
    shippingDetails: {
        fullName: {
            type: String,
            required: [true, 'الاسم الكامل مطلوب'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'رقم الهاتف مطلوب'],
            trim: true,
            validate: {
                validator: function(v) {
                    return /^01[0125][0-9]{8}$/.test(v);
                },
                message: props => `${props.value} ليس رقم هاتف مصري صحيح`
            }
        },
        address: {
            type: String,
            required: [true, 'العنوان مطلوب'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'المدينة مطلوبة'],
            trim: true
        },
        notes: {
            type: String,
            trim: true,
            default: ''
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });

orderSchema.methods.validateOrder = async function() {
    if (this.buyer.toString() === this.seller.toString()) {
        throw new Error('لا يمكنك شراء منتجاتك');
    }

    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    
    if (!product) {
        throw new Error('المنتج غير موجود');
    }

    if (product.quantity < this.quantity) {
        throw new Error('الكمية المطلوبة غير متوفرة');
    }

    const expectedPrice = product.price * this.quantity;
    if (Math.abs(expectedPrice - this.totalPrice) > 0.01) {
        throw new Error('السعر الإجمالي غير صحيح');
    }

    const { fullName, phone, address, city } = this.shippingDetails;
    if (!fullName?.trim() || !phone?.trim() || !address?.trim() || !city?.trim()) {
        throw new Error('جميع تفاصيل الشحن مطلوبة');
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
        throw new Error('رقم الهاتف غير صحيح');
    }

    return true;
};

orderSchema.pre('save', async function(next) {
    try {
        if (this.isNew) {
            await this.validateOrder();
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;