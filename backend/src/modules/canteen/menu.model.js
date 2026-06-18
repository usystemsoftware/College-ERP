const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['Meals', 'Snacks', 'Beverages', 'Desserts'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema);
