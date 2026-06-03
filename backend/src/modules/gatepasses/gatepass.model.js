const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  visitorName: { type: String, required: true, trim: true },
  visitorPhone: { type: String, required: true },
  visitorIdType: { type: String, enum: ['Aadhar', 'PAN', 'Passport', 'DrivingLicense', 'Other'] },
  visitorIdNumber: { type: String },
  purpose: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  entryTime: { type: Date },
  exitTime: { type: Date },
  vehicleNumber: { type: String },
  numberOfVisitors: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'CheckedIn', 'CheckedOut'],
    default: 'Pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  remarks: { type: String },
  photo: { type: String }, // Cloudinary URL
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

gatePassSchema.index({ status: 1, createdAt: -1 });
gatePassSchema.index({ host: 1 });

module.exports = mongoose.model('GatePass', gatePassSchema);
