// /server/models/Products.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return v > 0;
      },
      message: 'Price must be greater than 0'
    }
  },
  priceHistory: [{
    price: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'accessories', 'home', 'other']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/200x200.png?text=Product+Image'
  },
  stock: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 10, // Change from 0 to 10
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be a whole number'
    }
  },
  safetyStock: {
    type: Number,
    min: 0,
    default: 5
  },
  allowBackorder: {
    type: Boolean,
    default: false
  },
  lastRestock: Date,
  version: { type: Number, default: 0 }
}, {
  timestamps: true
});

productSchema.methods.getSafeStockInfo = function () {
  return {
    _id: this._id,
    name: this.name,
    price: this.price,
    availableStock: this.stock,
    maxOrderQty: Math.min(this.stock, 10) // Limits max purchase quantity
  };
};

// Price change tracking
productSchema.pre('save', function (next) {
  if (this.isModified('price')) {
    const currentPrice = this.price;

    // Only add if different from last entry
    if (this.priceHistory.length === 0 ||
      this.priceHistory[this.priceHistory.length - 1].price !== currentPrice) {
      this.priceHistory.push({ price: currentPrice });
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);