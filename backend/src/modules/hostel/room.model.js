const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomNumber: { type: String, required: true },
  floor: { type: Number, default: 0 },
  type: { type: String, enum: ['Single', 'Double', 'Triple', 'Dormitory'], default: 'Double' },
  capacity: { type: Number, required: true },
  occupied: { type: Number, default: 0 },
  feePerSemester: { type: Number, required: true },
  feePerYear: { type: Number },
  amenities: [{ type: String }],
  status: { type: String, enum: ['Available', 'Full', 'Maintenance'], default: 'Available' },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ hostel: 1, status: 1 });

module.exports = mongoose.model('Room', roomSchema);
