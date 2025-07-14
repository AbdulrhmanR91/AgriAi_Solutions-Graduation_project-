import mongoose from 'mongoose';

const ConsultOrderSchema = new mongoose.Schema({
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Expert is required']
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer is required']
  },
  problem: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  response: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Check if model exists before creating
const ConsultOrder = mongoose.models.ConsultOrder || mongoose.model('ConsultOrder', ConsultOrderSchema);

export default ConsultOrder;