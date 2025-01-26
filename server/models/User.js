// /server/models/User.js
import mongoose from 'mongoose';
import Product  from './Product';

const userSchema  = new mongoose.Schema({
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

userSchema.post('find', async function (docs) {
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

export default mongoose.model('User', userSchema); 