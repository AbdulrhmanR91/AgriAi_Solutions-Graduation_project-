import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getFarmerProfile, updateFarmerProfile } from '../controllers/farmerController.js';
import multer from 'multer';
import User from '../models/User.js';

const router = Router();

// إعداد multer لرفع الصور
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// مسارات الملف الشخصي للمزارع
router.get('/profile', auth, getFarmerProfile);
router.put('/profile', auth, updateFarmerProfile);

// مسار إضافة مزرعة جديدة
router.post('/farms', auth, async (req, res) => {
    try {
        const farmer = await User.findById(req.user.id);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        // التحقق من البيانات
        const { farmName, farmLocation, farmSize, mainCrops } = req.body;
        if (!farmName || !farmLocation || !farmSize || !mainCrops) {
            return res.status(400).json({
                success: false,
                message: 'All farm details are required'
            });
        }

        // إضافة المزرعة الجديدة
        if (!farmer.farms) {
            farmer.farms = [];
        }

        farmer.farms.push({
            farmName,
            farmLocation,
            farmSize: parseFloat(farmSize),
            mainCrops: Array.isArray(mainCrops) ? mainCrops : [mainCrops]
        });

        await farmer.save();

        res.status(201).json({
            success: true,
            message: 'Farm added successfully',
            data: farmer.farms[farmer.farms.length - 1]
        });
    } catch (error) {
        console.error('Error adding new farm:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// مسار رفع الصور
router.post('/upload-image', auth, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`;
        
        // تحديث صورة البروفايل في قاعدة البيانات
        const farmer = await User.findByIdAndUpdate(req.user.id, {
            profileImage: imageUrl
        }, { new: true });

        res.json({
            success: true,
            imageUrl: imageUrl,
            data: farmer
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
});

export default router;