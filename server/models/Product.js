// /server/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: [0.01, 'Price must be at least $0.01'],
    set: v => Math.round(v * 100) / 100 // Store as cents
  },
  priceHistory: [{
    price: Number,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  stock: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'home', 'other'],
    required: true
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted price
productSchema.virtual('priceFormatted').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Price change tracking
productSchema.pre('save', function(next) {
  if (this.isModified('price') && !this.isNew) {
    this.priceHistory.push({ price: this.price });
  }
  next();
});

// Stock status indicator
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

productSchema.index({ category: 1, price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;