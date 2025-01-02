/* eslint-env node */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['farmer', 'expert', 'company']
    },
    // حقول إضافية حسب نوع المستخدم
    // للمزارع
    farmDetails: {
        farmName: String,
        farmLocation: String,
        farmSize: Number,
        crops: String,
        idDocument: {
            filename: String,
            path: String,
            mimetype: String,
            uploadDate: {
                type: Date,
                default: Date.now
            }
        }
    },
    // للخبير
    expertDetails: {
        expertAt: String,
        university: String,
        college: String,
        services: String,
        idDocument: {
            filename: String,
            path: String,
            mimetype: String,
            uploadDate: {
                type: Date,
                default: Date.now
            }
        }
    },
    // للشركة
    companyDetails: {
        companyName: String,
        businessAddress: String,
        governorate: String,
        tradeLicenseNumber: String,
        taxRegistrationNumber: String
    }
}, {
    timestamps: true
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User; 