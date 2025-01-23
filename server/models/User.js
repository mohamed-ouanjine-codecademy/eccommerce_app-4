// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  isAdmin: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

UserSchema.post('find', async function (docs) {
  if (!Array.isArray(docs)) return;
  
  for (const user of docs) {
    if (user.cart?.length) {
      const validProducts = await Product.find({
        _id: { $in: user.cart.map(i => i.product) }
      });
      
      user.cart = user.cart.filter(item => 
        validProducts.some(p => p._id.equals(item.product))
      );
      await user.save();
    }
  }
});

module.exports = mongoose.model('User', UserSchema);