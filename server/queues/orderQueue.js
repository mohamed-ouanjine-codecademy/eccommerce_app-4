// /server/queues/orderQueue.js
import Queue from 'bull';
const orderQueue = new Queue('order processing');

orderQueue.process(async job => {
  const { productId, quantity } = job.data;
  const product = await Product.findById(productId);

  if (product.stock >= quantity) {
    product.stock -= quantity;
    await product.save();
    return { success: true };
  }
  return { success: false };
});

// In your order route
router.post('/', async (req, res) => {
  const job = await orderQueue.add({
    productId: 'running-shoes-id',
    quantity: 1
  });
  
  job.on('completed', result => {
    if (result.success) {
      // Complete order
    } else {
      // Handle out of stock
    }
  });
});