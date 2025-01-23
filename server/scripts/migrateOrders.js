const mongoose = require('mongoose');
require('dotenv').config();
require('../models/Order');
require('../models/Product');

const fixZeroPrices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    const Order = mongoose.model('Order');
    const orders = await Order.find().populate({
      path: 'items.product',
      model: 'Product',
      select: 'price name'
    });

    console.log(`Found ${orders.length} orders to check`);
    let fixedCount = 0;

    for (const order of orders) {
      console.log(`\nChecking order ${order._id}`);
      let modified = false;
      
      for (const [index, item] of order.items.entries()) {
        console.log(`Item ${index + 1}:`);
        console.log(' - Stored price:', item.price);
        console.log(' - Product price:', item.product?.price);
        console.log(' - Quantity:', item.quantity);

        if (
          (item.price === 0 || item.price === null || item.price === undefined) &&
          item.product?.price > 0
        ) {
          console.log(' ! Needs update');
          item.price = item.product.price;
          modified = true;
        } else {
          console.log(' ✓ Price OK');
        }
      }

      if (modified) {
        order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        await order.save();
        fixedCount++;
        console.log(`✅ Updated order ${order._id}`);
      }
    }

    console.log(`\nMigration complete. Fixed ${fixedCount} orders`);
    process.exit(0);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

fixZeroPrices();