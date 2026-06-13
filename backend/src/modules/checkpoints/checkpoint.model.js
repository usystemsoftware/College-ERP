const mongoose = require('mongoose');

const checkpointSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['left_home', 'arrived_school', 'left_school'],
    required: true
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  scannedAt: { type: Date, default: Date.now },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

checkpointSchema.index({ student: 1, scannedAt: -1 });
checkpointSchema.index({ collegeId: 1, scannedAt: -1 });
// Prevent duplicate checkpoint scans within a short time window
checkpointSchema.index({ student: 1, type: 1, scannedAt: 1 });

module.exports = mongoose.model('Checkpoint', checkpointSchema);
