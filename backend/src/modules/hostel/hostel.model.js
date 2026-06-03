const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Boys', 'Girls', 'Co-ed'], required: true },
  address: { type: String },
  warden: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to faculty or staff
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupancy: { type: Number, default: 0 },
  type: { type: String, enum: ['AC', 'Non-AC'], default: 'Non-AC' },
  baseFee: { type: Number, required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

// Ensure room numbers are unique within a hostel
roomSchema.index({ hostelId: 1, roomNumber: 1 }, { unique: true });

const hostelAllocationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['Active', 'Vacated'], default: 'Active' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

const Hostel = mongoose.model('Hostel', hostelSchema);
const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
const HostelAllocation = mongoose.model('HostelAllocation', hostelAllocationSchema);

module.exports = { Hostel, Room, HostelAllocation };
