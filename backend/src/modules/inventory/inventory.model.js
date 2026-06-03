const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, enum: ['Electronics', 'Furniture', 'Lab Equipment', 'Stationery', 'Other'], required: true },
  quantity: { type: Number, required: true, default: 1 },
  location: { type: String, required: true }, // e.g., "Computer Lab 1"
  purchaseDate: { type: Date },
  cost: { type: Number },
  status: { type: String, enum: ['In Use', 'In Storage', 'Under Repair', 'Discarded'], default: 'In Use' }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
