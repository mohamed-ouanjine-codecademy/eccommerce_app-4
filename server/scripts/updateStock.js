// /server/scripts/updateStock.js
import mongoose from 'mongoose';
require('dotenv').config();
require('../models/Product'); // Path to your Product model

async function updateStock() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    const result = await mongoose.model('Product').updateMany(
      { stock: { $exists: false } },
      { $set: { stock: 10 } }
    );

    console.log(`Updated ${result.modifiedCount} products`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

updateStock();