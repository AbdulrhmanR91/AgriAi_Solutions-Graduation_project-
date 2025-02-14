import mongoose from 'mongoose';
const { Schema } = mongoose;

const farmerSchema = new Schema({
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
    farmSize: {
        type: Number,
        required: true
    },
    mainCrops: [{
        type: String
    }],
    profileImage: {
        type: String,
        default: 'default-profile.jpg'
    }
}, {
    timestamps: true
});

const Farmer = mongoose.model('Farmer', farmerSchema);
export default Farmer;