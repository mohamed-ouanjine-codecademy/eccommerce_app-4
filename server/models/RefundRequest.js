// /server/models/RefundRequest.js
import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema({
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  reason: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending'
  },
  processedAt: Date
}, { 
  timestamps: true 
});

// Change to CommonJS syntax
module.exports = mongoose.model('RefundRequest', refundRequestSchema);