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
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be at least $0.01'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Price must be greater than 0'
    },
    set: v => parseFloat(v.toFixed(2)) // Ensure 2 decimal places
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
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

// Price change tracking
productSchema.pre('save', function(next) {
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