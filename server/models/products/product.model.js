// server/modules/products/product.model.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: 'text'
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
    set: v => Math.round(v * 100) / 100
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'home', 'other']
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      return ret;
    }
  }
});

productSchema.virtual('priceFormatted').get(function() {
  return `$${this.price.toFixed(2)}`;
});

export default mongoose.model('Product', productSchema);