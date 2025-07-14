import mongoose from 'mongoose';

const farmerVisitSchema = new mongoose.Schema({
    expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expert',
        required: true
    },
    // Manual farmer information (not linked to Farmer model)
    farmerName: {
        type: String,
        required: true
    },
    farmerPhone: {
        type: String,
        default: ''
    },
    farmName: {
        type: String,
        required: true
    },
    farmLocation: {
        type: String,
        required: true
    },
    visitDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastVisitDate: {
        type: Date
    },
    problemDescription: {
        type: String,
        required: true
    },
    expertNotes: {
        type: String,
        default: ''
    },
    followUpStatus: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'needs_followup'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    nextVisitDate: {
        type: Date
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    // Additional visit details
    visitType: {
        type: String,
        enum: ['initial', 'followup', 'emergency'],
        default: 'initial'
    },
    visitDuration: {
        type: Number, // in minutes
        default: 0
    },
    // Photos and documents
    visitPhotos: [{
        type: String // paths to uploaded photos
    }],
    // Treatment recommendations
    treatmentRecommendations: [{
        type: String
    }],
    // Follow-up actions
    followUpActions: [{
        action: String,
        dueDate: Date,
        completed: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

// Index for efficient querying
farmerVisitSchema.index({ expert: 1, visitDate: -1 });
farmerVisitSchema.index({ farmer: 1, visitDate: -1 });
farmerVisitSchema.index({ followUpStatus: 1 });

// Virtual for farmer info
farmerVisitSchema.virtual('farmerInfo', {
    ref: 'Farmer',
    localField: 'farmer',
    foreignField: '_id',
    justOne: true
});

// Virtual for expert info
farmerVisitSchema.virtual('expertInfo', {
    ref: 'Expert',
    localField: 'expert',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
farmerVisitSchema.set('toJSON', { virtuals: true });

export default mongoose.model('FarmerVisit', farmerVisitSchema);
