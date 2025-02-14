import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

// الحصول على بيانات الشركة من جدول users
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('Getting company profile for user:', req.user.id);
        
        // البحث في جدول users
        const user = await User.findOne({
            _id: req.user.id,
            userType: 'company'
        }).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على بيانات الشركة'
            });
        }

        // تنسيق البيانات من جدول users بشكل كامل
        const formattedCompany = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            profileImage: user.profileImage || '',
            companyDetails: {
                companyName: user.companyDetails?.companyName || user.name,
                businessAddress: user.companyDetails?.businessAddress || user.location,
                tradeLicenseNumber: user.companyDetails?.tradeLicenseNumber || '',
                taxRegistrationNumber: user.companyDetails?.taxRegistrationNumber || ''
            }
        };

        console.log('Found company in users:', formattedCompany);
        
        res.json({
            success: true,
            data: formattedCompany
        });
    } catch (error) {
        console.error('Error in getCompanyProfile:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم',
            error: error.message
        });
    }
});

// تحديث بيانات الشركة في جدول users
router.put('/profile', auth, async (req, res) => {
    try {
        console.log('Received update data:', req.body);
        
        const updates = req.body;
        const updatedUser = await User.findOneAndUpdate(
            {
                _id: req.user.id,
                userType: 'company'
            },
            {
                $set: {
                    name: updates.name,
                    phone: updates.phone,
                    'companyDetails.companyName': updates.companyDetails?.companyName || updates.name,
                    'companyDetails.businessAddress': updates.companyDetails?.businessAddress,
                    'companyDetails.tradeLicenseNumber': updates.companyDetails?.tradeLicenseNumber,
                    'companyDetails.taxRegistrationNumber': updates.companyDetails?.taxRegistrationNumber
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'الشركة غير موجودة'
            });
        }

        // تنسيق البيانات قبل إرجاعها
        const formattedCompany = {
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location,
            profileImage: updatedUser.profileImage || '',
            companyDetails: {
                companyName: updatedUser.companyDetails?.companyName || updatedUser.name,
                businessAddress: updatedUser.companyDetails?.businessAddress || '',
                tradeLicenseNumber: updatedUser.companyDetails?.tradeLicenseNumber || '',
                taxRegistrationNumber: updatedUser.companyDetails?.taxRegistrationNumber || ''
            }
        };

        res.json({
            success: true,
            data: formattedCompany
        });
        
    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        let filter = { userType: 'company' };
        
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { 'companyDetails.companyName': { $regex: query, $options: 'i' } },
                { 'companyDetails.businessAddress': { $regex: query, $options: 'i' } }
            ];
        }

        const companies = await User.find(filter)
            .select('name companyDetails profileImage phone')
            .sort({ createdAt: -1 });

        const formattedCompanies = companies.map(company => ({
            _id: company._id,
            name: company.name,
            phone: company.phone,
            profileImage: company.profileImage,
            companyDetails: {
                companyName: company.companyDetails?.companyName || '',
                businessAddress: company.companyDetails?.businessAddress || '',
                businessType: company.companyDetails?.businessType || '',
            }
        }));

        res.json({
            success: true,
            data: formattedCompanies
        });
    } catch (error) {
        console.error('خطأ في البحث عن الشركات:', error);
        res.status(500).json({ 
            success: false,
            message: 'فشل في جلب الشركات',
            error: error.message
        });
    }
});


export default router; 