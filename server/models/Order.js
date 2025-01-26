// /server/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    priceAtPurchase: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true,
    min: [0.01, 'Total must be at least $0.01']
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'US'
    },
    zipCode: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentId: String,
  trackingNumber: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted order date
orderSchema.virtual('orderDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Prevent invalid order modifications
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'cancelled') {
    if (this.paymentStatus !== 'completed') {
      return next(new Error('Only paid orders can be cancelled'));
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;