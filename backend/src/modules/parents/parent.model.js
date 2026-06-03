const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  email: { type: String, lowercase: true, trim: true },
  occupation: { type: String },
  address: { type: String },
  relation: { type: String, enum: ['Father', 'Mother', 'Guardian'], default: 'Father' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

parentSchema.index({ collegeId: 1 });

module.exports = mongoose.model('Parent', parentSchema);
