import mongoose from 'mongoose';

const plantAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  condition: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500
  },
  originalPrediction: {
    type: String,
    trim: true,
    maxLength: 200
  },
  severity: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  treatment: [{
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  }],
  imageBase64: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const PlantAnalysis = mongoose.model('PlantAnalysis', plantAnalysisSchema);
export default PlantAnalysis;