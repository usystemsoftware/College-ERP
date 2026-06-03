const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

// Get all users (filterable)
router.get('/', userController.getUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user details (e.g. status) - Require admin roles
router.put('/:id', authorize('Super Admin', 'College Admin'), userController.updateUser);

// Delete user - Require Super Admin
router.delete('/:id', authorize('Super Admin'), userController.deleteUser);

module.exports = router;
