const mongoose = require('mongoose');

const feeCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Tuition Fee', 'Hostel Fee', 'Transport Fee'
  description: { type: String },
  isOptional: { type: Boolean, default: false }, // If true, it's not automatically applied to everyone
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

feeCategorySchema.index({ name: 1, collegeId: 1 }, { unique: true });

module.exports = mongoose.model('FeeCategory', feeCategorySchema);
