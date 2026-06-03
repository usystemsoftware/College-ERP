const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['Boys', 'Girls', 'Co-ed'], required: true },
  wardenName: { type: String, required: true },
  wardenPhone: { type: String, required: true },
  wardenEmail: { type: String },
  address: { type: String, required: true },
  totalRooms: { type: Number, default: 0 },
  totalCapacity: { type: Number, default: 0 },
  amenities: [{ type: String }], // ['WiFi', 'Gym', 'Mess']
  status: { type: String, enum: ['Active', 'Inactive', 'UnderMaintenance'], default: 'Active' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

hostelSchema.index({ collegeId: 1, type: 1 });

module.exports = mongoose.model('Hostel', hostelSchema);
