/* eslint-env node */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'الاسم مطلوب'],
        trim: true,
        minlength: [3, 'الاسم يجب أن يكون على الأقل 3 أحرف']
    },
    email: {
        type: String,
        required: [true, 'البريد الإلكتروني مطلوب'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صالح']
    },
    password: {
        type: String,
        required: [true, 'كلمة المرور مطلوبة'],
        minlength: [6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف']
    },
    phone: {
        type: String,
        required: [true, 'رقم الهاتف مطلوب'],
        match: [/^\+?[0-9]{10,14}$/, 'رقم الهاتف غير صالح']
    },
    userType: {
        type: String,
        required: [true, 'نوع المستخدم مطلوب'],
        enum: {
            values: ['farmer', 'expert', 'company'],
            message: 'نوع المستخدم غير صالح'
        }
    },
    // حقول إضافية حسب نوع المستخدم
    // للمزارع
    farmDetails: {
        farmName: {
            type: String,
            required: [function() { 
                return this.userType === 'farmer'; 
            }, 'اسم المزرعة مطلوب للمزارع'],
            trim: true,
            minlength: [2, 'اسم المزرعة يجب أن يكون على الأقل حرفين']
        },
        farmSize: {
            type: Number,
            required: [function() { 
                return this.userType === 'farmer'; 
            }, 'حجم المزرعة مطلوب للمزارع'],
            min: [0, 'حجم المزرعة يجب أن يكون أكبر من أو يساوي صفر']
        },
        mainCrops: {
            type: [String],
            validate: {
                validator: function(crops) {
                    if (this.userType !== 'farmer') return true;
                    return Array.isArray(crops) && crops.length > 0 && 
                           crops.every(crop => crop && crop.trim().length > 0);
                },
                message: 'يجب إضافة محصول واحد على الأقل'
            }
        },
        farmLocation: {
            type: String,
            required: [function() { 
                return this.userType === 'farmer'; 
            }, 'موقع المزرعة مطلوب للمزارع'],
            trim: true
        }
    },
    // دعم المزارع المتعددة
    farms: [{
        farmName: {
            type: String,
            required: [true, 'اسم المزرعة مطلوب'],
            trim: true,
            minlength: [2, 'اسم المزرعة يجب أن يكون على الأقل حرفين']
        },
        farmSize: {
            type: Number,
            required: [true, 'حجم المزرعة مطلوب'],
            min: [0, 'حجم المزرعة يجب أن يكون أكبر من أو يساوي صفر']
        },
        mainCrops: {
            type: [String],
            validate: {
                validator: function(crops) {
                    return Array.isArray(crops) && crops.length > 0 && 
                           crops.every(crop => crop && crop.trim().length > 0);
                },
                message: 'يجب إضافة محصول واحد على الأقل'
            }
        },
        farmLocation: {
            type: String,
            required: [true, 'موقع المزرعة مطلوب'],
            trim: true
        }
    }],
    // للخبير
    expertDetails: {
        _id: false,
        expertAt: {
            type: String,
            required: [function() { 
                return this.userType === 'expert'; 
            }, 'التخصص مطلوب للخبير']
        },
        university: {
            type: String,
            required: [function() { 
                return this.userType === 'expert'; 
            }, 'الجامعة مطلوبة للخبير']
        },
        college: {
            type: String,
            required: [function() { 
                return this.userType === 'expert'; 
            }, 'الكلية مطلوبة للخبير']
        },
        services: {
            type: [String],
            validate: {
                validator: function(services) {
                    if (this.userType !== 'expert') return true;
                    return Array.isArray(services) && services.length > 0 && 
                           services.every(service => service && service.length >= 3);
                },
                message: 'يجب إضافة خدمة واحدة على الأقل للخبير، وكل خدمة يجب أن تكون على الأقل 3 أحرف'
            }
        },
        verified: {
            type: Boolean,
            default: false
        }
    },
    // للشركة
    companyDetails: {
        companyName: {
            type: String,
            required: [function() { 
                return this.userType === 'company'; 
            }, 'اسم الشركة مطلوب']
        },
        businessAddress: {
            type: String,
            required: [function() { 
                return this.userType === 'company'; 
            }, 'عنوان الشركة مطلوب']
        },
       
        tradeLicenseNumber: {
            type: String,
            required: [function() { 
                return this.userType === 'company'; 
            }, 'رقم الرخصة التجارية مطلوب']
        },
        taxRegistrationNumber: {
            type: String,
            required: [function() { 
                return this.userType === 'company'; 
            }, 'رقم التسجيل الضريبي مطلوب']
        }
    },
    profileImage: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// دالة للتحقق من كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('خطأ في التحقق من كلمة المرور');
    }
};

// دالة لإخفاء البيانات الحساسة
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);
export default User; 