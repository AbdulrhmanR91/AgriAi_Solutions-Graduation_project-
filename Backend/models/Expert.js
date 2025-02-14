import { Schema, model } from 'mongoose';

const expertSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    qualifications: [{
        degree: String,
        institution: String,
        year: Number
    }],
    certifications: [{
        name: String,
        issuer: String,
        year: Number
    }],
    profileImage: {
        type: String,
        default: 'default-profile.jpg'
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    consultationFee: {
        type: Number,
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default model('Expert', expertSchema); 