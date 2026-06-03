const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fullName: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  workloadHours: {
    type: Number,
    default: 0
  },
  leaveBalance: {
    casual: { type: Number, default: 12 },
    medical: { type: Number, default: 10 },
    earned: { type: Number, default: 15 }
  },
  joiningDate: {
    type: Date,
    required: true
  },
  phone: { type: String },
  email: { type: String, lowercase: true },
  specialization: { type: String },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
