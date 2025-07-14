import asyncHandler from '../middleware/async.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import ConsultOrder from '../models/ConsultOrder.js';
import Product from '../models/Product.js';
import PlantAnalysis from '../models/PlantAnalysis.js';


export const getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get user stats
  const userStats = await User.aggregate([
    {
      $group: {
        _id: '$userType',
        count: { $sum: 1 }
      }
    }
  ]);

  // Format user stats
  const formattedUserStats = {
    farmers: userStats.find(stat => stat._id === 'farmer')?.count || 0,
    experts: userStats.find(stat => stat._id === 'expert')?.count || 0,
    companies: userStats.find(stat => stat._id === 'company')?.count || 0,
    total: userStats.reduce((acc, stat) => acc + stat.count, 0)
  };

  // Get order stats
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' }
      }
    }
  ]);

  // Get consult order stats
  const totalConsultations = await ConsultOrder.countDocuments();
  
  // Get product stats
  const totalProducts = await Product.countDocuments();
  
  // Get analysis stats
  const totalAnalyses = await PlantAnalysis.countDocuments();
  
  // Recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email userType createdAt');
    
  // Recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('buyer', 'name')
    .populate('seller', 'name')
    .select('totalPrice status createdAt');

  res.status(200).json({
    success: true,
    data: {
      users: formattedUserStats,
      orders: {
        total: totalOrders,
        revenue: totalRevenue[0]?.total || 0
      },
      consultations: {
        total: totalConsultations
      },
      products: {
        total: totalProducts
      },
      analyses: {
        total: totalAnalyses
      },
      recent: {
        users: recentUsers,
        orders: recentOrders
      }
    }
  });
});
