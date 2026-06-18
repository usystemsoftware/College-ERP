const Menu = require('./menu.model');
const Order = require('./order.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// --- MENU MANAGEMENT ---

// Get all menu items
const getMenu = async (req, res, next) => {
  try {
    const filter = { collegeId: req.user.collegeId };
    if (req.user.role.name === 'Student' || req.user.role.name === 'Faculty') {
      filter.isAvailable = true; // Users only see available items
    }
    
    const menu = await Menu.find(filter).sort({ category: 1, name: 1 });
    return res.json(new ApiResponse(200, menu, 'Menu fetched successfully'));
  } catch (error) { next(error); }
};

// Add a menu item (Admin)
const addMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, isAvailable, imageUrl } = req.body;
    
    const menuItem = await Menu.create({
      name,
      description,
      price,
      category,
      isAvailable,
      imageUrl,
      collegeId: req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, menuItem, 'Menu item added successfully'));
  } catch (error) { next(error); }
};

// Toggle availability (Admin)
const toggleMenuItemAvailability = async (req, res, next) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) throw new ApiError(404, 'Menu item not found');
    
    if (menuItem.collegeId.toString() !== req.user.collegeId.toString() && req.user.role.name !== 'Super Admin') {
      throw new ApiError(403, 'Not authorized');
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    return res.json(new ApiResponse(200, menuItem, 'Menu item availability toggled'));
  } catch (error) { next(error); }
};

// --- ORDER MANAGEMENT ---

// Place an order (Student/Faculty)
const placeOrder = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { menuItemId, quantity }
    
    if (!items || items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        throw new ApiError(400, `Item ${item.menuItemId} is currently unavailable`);
      }
      
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        priceAtTimeOfOrder: menuItem.price
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      collegeId: req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
  } catch (error) { next(error); }
};

// Get my orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 });
      
    return res.json(new ApiResponse(200, orders, 'Your orders fetched successfully'));
  } catch (error) { next(error); }
};

// Get all incoming orders (Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const filter = { collegeId: req.user.collegeId };
    
    // Admins usually only need to see active orders (Pending, Preparing, Ready) on the dashboard
    // but they can query completed ones if needed.
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName rollNumber')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
      
    return res.json(new ApiResponse(200, orders, 'All orders fetched successfully'));
  } catch (error) { next(error); }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) throw new ApiError(404, 'Order not found');
    
    if (order.collegeId.toString() !== req.user.collegeId.toString() && req.user.role.name !== 'Super Admin') {
      throw new ApiError(403, 'Not authorized');
    }

    order.status = status;
    await order.save();

    return res.json(new ApiResponse(200, order, `Order marked as ${status}`));
  } catch (error) { next(error); }
};

module.exports = {
  getMenu,
  addMenuItem,
  toggleMenuItemAvailability,
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};
