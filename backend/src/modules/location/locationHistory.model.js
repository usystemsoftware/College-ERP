const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  status: {
    type: String,
    enum: ['at_home', 'on_way_to_school', 'at_school', 'on_way_home', 'unknown'],
    default: 'unknown'
  },
  accuracy: { type: Number }, // GPS accuracy in meters
  speed: { type: Number }, // Speed in m/s
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }
}, { timestamps: true });

locationHistorySchema.index({ student: 1, createdAt: -1 });
locationHistorySchema.index({ collegeId: 1, createdAt: -1 });

// Auto-expire old records after 30 days
locationHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('LocationHistory', locationHistorySchema);
