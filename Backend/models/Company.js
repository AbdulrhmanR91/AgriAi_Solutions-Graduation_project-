import { Schema, model } from 'mongoose';

const companySchema = new Schema({
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
    location: {
        type: String,
        required: true
    },
    commercialRegister: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        default: 'default-logo.jpg'
    },
    services: [{
        name: String,
        description: String,
        price: Number
    }],
    products: [{
        name: String,
        description: String,
        price: Number,
        category: String,
        stock: Number,
        images: [String]
    }],
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default model('Company', companySchema); 