import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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

        const transformedData = {
            ...farmer,
            contact: {
                email: farmer.email,
                phone: farmer.phone,
                location: farmer.location || ''
            },
            farms: farmer.farms?.map(farm => ({
                _id: farm._id,
                farmName: farm.farmName,
                farmLocation: farm.farmLocation,
                farmLocationText: farm.farmLocationText || '',
                farmSize: farm.farmSize,
                mainCrops: farm.mainCrops || [],
                createdAt: farm.createdAt
            })) || []
        };

        res.json({
            success: true,
            data: transformedData
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

export const updateFarmerProfile = async (req, res) => {
    try {
        const updates = req.body;
        console.log('Updating farmer profile with data:', updates);

        const farmer = await User.findById(req.user.id);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

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

export const getAllFarmers = async (req, res) => {
    try {
        const farmers = await User.find({ userType: 'farmer' })
            .select('name email phone profileImage')
            .lean();

        res.json({
            success: true,
            data: farmers
        });
    } catch (error) {
        console.error('Error in getAllFarmers:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};