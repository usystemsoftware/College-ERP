const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ['Student', 'Visitor'],
    default: 'Visitor'
  },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  visitorName: { type: String, trim: true },
  visitorPhone: { type: String },
  visitorIdType: { type: String, enum: ['Aadhar', 'PAN', 'Passport', 'DrivingLicense', 'Other'] },
  visitorIdNumber: { type: String },
  purpose: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  outDateTime: { type: Date },
  expectedReturnDateTime: { type: Date },
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
  photo: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

gatePassSchema.pre('validate', function (next) {
  if (this.requestType === 'Visitor') {
    if (!this.visitorName) this.invalidate('visitorName', 'Visitor name is required for visitor passes');
    if (!this.visitorPhone) this.invalidate('visitorPhone', 'Visitor phone is required for visitor passes');
  }
  next();
});

gatePassSchema.index({ status: 1, createdAt: -1 });
gatePassSchema.index({ host: 1 });
gatePassSchema.index({ student: 1 });
gatePassSchema.index({ assignedTo: 1, status: 1 });

if (mongoose.models.GatePass) {
  delete mongoose.connection.models.GatePass;
  delete mongoose.models.GatePass;
}

module.exports = mongoose.model('GatePass', gatePassSchema);
