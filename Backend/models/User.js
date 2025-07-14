/* eslint-env node */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    validate: {
      validator: function(v) {
        // Only validate phone on user creation or when phone is modified
        if (this.isNew || this.isModified('phone')) {
          const cleanPhone = v.replace(/^\+?20/, '');
          return /^01[0125][0-9]{8}$/.test(cleanPhone);
        }
        return true;
      },
      message: 'Please add a valid Egyptian phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  userType: {
    type: String,
    enum: ['farmer', 'expert', 'company'],
    required: [true, 'Please select a user type']
  },
  blocked: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  farms: [{
    farmName: {
      type: String,
      required: true
    },
    farmLocation: {
      type: String,
      required: true
    },
    farmLocationText: {
      type: String,
      default: ''
    },
    farmSize: {
      type: Number,
      required: true
    },
    mainCrops: {
      type: [String],
      required: true,
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  farmDetails: {
    farmName: {
      type: String,
      default: ''
    },
    farmLocation: {
      type: String,
      default: ''
    },
    farmSize: {
      type: Number,
      default: 0
    },
    crops: {
      type: [String],
      default: []
    }
  },
  expertDetails: {
    expertAt: {
      type: String,
      default: ''
    },
    university: {
      type: String,
      default: ''
    },
    college: {
      type: String,
      default: ''
    },
    services: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      default: ''
    },
    experience: {
      type: Number,
      default: 0
    },
    specialization: {
      type: String,
      default: ''
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    ratingsCount: {
      type: Number,
      default: 0
    }
  },
  companyDetails: {                  
    companyName: {
      type: String,
      default: ''
    },
    businessAddress: {
      type: String,
      default: ''
    },
    tradeLicenseNumber: {
      type: String,
      default: ''
    },
    taxRegistrationNumber: {
      type: String,
      default: ''
    },
    location: {                     
      lat: {
        type: Number,
        default: null
      },
      lng: {
        type: Number,
        default: null
      }
    }
  }
});

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;