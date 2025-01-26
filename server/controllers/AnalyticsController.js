// server/controllers/AnalyticsController.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export default class AnalyticsController {
  async getSalesAnalytics() {
    const [orders, products, users] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalSales: { $sum: "$total" },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      Product.aggregate([
        { $sort: { stock: 1 } },
        { $limit: 5 },
        { $project: { name: 1, stock: 1 } }
      ]),
      
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $gt: ["$lastLogin", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    return {
      salesTrend: orders,
      lowStockProducts: products,
      userStatistics: users[0]
    };
  }

  async getProductPerformance(productId) {
    return Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.product": productId } },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] } }
        }
      }
    ]);
  }
}