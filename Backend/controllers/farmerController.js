import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// الحصول على بيانات المزارع
export const getFarmerProfile = async (req, res) => {
    try {
        console.log('Getting farmer profile for user:', req.user.id);
        
        const farmer = await User.findById(req.user.id)
            .select('-password')
            .lean();

        if (!farmer) {
            console.log('Farmer not found');
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        console.log('Found farmer:', farmer);
        
        res.json({
            success: true,
            data: farmer
        });
    } catch (error) {
        console.error('Error in getFarmerProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// تحديث بيانات المزارع
export const updateFarmerProfile = async (req, res) => {
    try {
        const updates = req.body;
        console.log('Updating farmer profile with data:', updates);

        // التحقق من وجود المزارع
        const farmer = await User.findById(req.user.id);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        // تحديث البيانات
        if (updates.farmDetails) {
            farmer.farmDetails = {
                ...farmer.farmDetails,
                ...updates.farmDetails
            };
        }

        if (updates.email) farmer.email = updates.email;
        if (updates.phone) farmer.phone = updates.phone;
        if (updates.location) farmer.location = updates.location;

        await farmer.save();

        // إرجاع البيانات المحدثة بدون كلمة المرور
        const updatedFarmer = await User.findById(req.user.id)
            .select('-password')
            .lean();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedFarmer
        });
    } catch (error) {
        console.error('Error updating farmer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}; 