import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = asyncHandler(async (req, res, next) => {
  // Set up pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments();

  // Filter by userType if provided
  const filter = {};
  if (req.query.userType) {
    filter.userType = req.query.userType;
  }

  // Search by name or email if provided
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ];
  }

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: users.length,
    pagination,
    total,
    data: users
  });
});

// @desc    Get single user with complete details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
export const getUser = asyncHandler(async (req, res, next) => {
  // Check for include parameters
  const includeAll = req.query.include || '';
  const include = {
    orders: includeAll.includes('orders'),
    products: includeAll.includes('products'),
    stats: includeAll.includes('stats'),
    consultations: includeAll.includes('consultations'),
    analyses: includeAll.includes('analyses')
  };

  // Find the basic user
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Convert mongoose document to plain object
  let userData = user.toObject();

  // If stats are requested
  if (include.stats) {
    // Calculate statistics based on user type
    if (user.userType === 'farmer' || user.userType === 'company') {
      // Product count
      userData.productCount = await Product.countDocuments({ seller: user._id });
      
      // Order count (both received and placed)
      const receivedOrders = await Order.countDocuments({ seller: user._id });
      const placedOrders = await Order.countDocuments({ buyer: user._id });
      userData.orderCount = {
        received: receivedOrders,
        placed: placedOrders,
        total: receivedOrders + placedOrders
      };

      // Revenue (from delivered orders)
      const revenueData = await Order.aggregate([
        { $match: { seller: user._id, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);
      userData.revenue = revenueData[0]?.total || 0;
    }

    if (user.userType === 'farmer') {
      // Analysis count
      userData.analysisCount = await PlantAnalysis.countDocuments({ user: user._id });
    }

    if (user.userType === 'expert') {
      // Consultation statistics
      const pendingConsults = await ConsultOrder.countDocuments({ 
        expert: user._id,
        status: 'pending'
      });
      
      const completedConsults = await ConsultOrder.countDocuments({ 
        expert: user._id,
        status: 'completed'
      });
      
      const totalConsults = await ConsultOrder.countDocuments({ expert: user._id });
      
      userData.consultCount = {
        pending: pendingConsults,
        completed: completedConsults,
        total: totalConsults
      };

      // Average rating
      const ratingData = await ConsultOrder.aggregate([
        { 
          $match: { 
            expert: user._id,
            rating: { $exists: true, $ne: null }
          }
        },
        { 
          $group: { 
            _id: null, 
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 }
          } 
        }
      ]);
      
      if (ratingData && ratingData[0]) {
        userData.averageRating = ratingData[0].avgRating.toFixed(1);
        userData.ratingCount = ratingData[0].count;
      }
    }
  }

  // Include related orders if requested
  if (include.orders) {
    let orderQuery;
    
    if (user.userType === 'expert') {
      // For experts, get consultations instead of product orders
      userData.orders = await ConsultOrder.find({ expert: user._id })
        .populate('farmer', 'name email')
        .sort('-createdAt')
        .limit(20);
    } else {
      // For farmers and companies, get relevant product orders
      const soldOrders = await Order.find({ seller: user._id })
        .populate('buyer', 'name email')
        .populate('product', 'name price')
        .sort('-createdAt')
        .limit(10);
      
      const boughtOrders = await Order.find({ buyer: user._id })
        .populate('seller', 'name email')
        .populate('product', 'name price')
        .sort('-createdAt')
        .limit(10);
      
      // Combine and sort by date
      userData.orders = [...soldOrders, ...boughtOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20); // Limit to 20 most recent
    }
  }

  // Include products if requested and user is seller
  if (include.products && (user.userType === 'farmer' || user.userType === 'company')) {
    userData.products = await Product.find({ seller: user._id })
      .sort('-createdAt')
      .limit(20);
  }

  // Include analyses if requested and user is farmer
  if (include.analyses && user.userType === 'farmer') {
    userData.analyses = await PlantAnalysis.find({ user: user._id })
      .sort('-createdAt')
      .limit(10);
  }

  // Include consultations if requested
  if (include.consultations) {
    if (user.userType === 'expert') {
      // Consultations provided
      userData.consultations = await ConsultOrder.find({ expert: user._id })
        .populate('farmer', 'name email')
        .sort('-createdAt')
        .limit(10);
    } else if (user.userType === 'farmer') {
      // Consultations received
      userData.consultations = await ConsultOrder.find({ farmer: user._id })
        .populate('expert', 'name email')
        .sort('-createdAt')
        .limit(10);
    }
  }

  res.status(200).json({
    success: true,
    data: userData
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
export const toggleBlockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Toggle blocked status
  user.blocked = !user.blocked;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
    message: user.blocked ? 'User has been blocked' : 'User has been unblocked'
  });
});
