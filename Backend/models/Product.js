import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: ['Fruits', 'Vegetables', 'Cotton', 'Others']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  sellerType: {
    type: String,
    enum: ['farmer', 'company'],
    required: [true, 'Seller type is required']
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Add a virtual for imageUrl
ProductSchema.virtual('imageUrl').get(function() {
  if (!this.image) return null;
  if (this.image.startsWith('http')) return this.image;
  return `/uploads/products/${this.image}`;
});

// Set virtuals when converting to JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// Check if model exists before creating
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
