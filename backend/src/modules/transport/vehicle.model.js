const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
  model: { type: String, required: true },
  type: { type: String, enum: ['Bus', 'Minibus', 'Van'], default: 'Bus' },
  capacity: { type: Number, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  driverLicense: { type: String },
  insuranceExpiry: { type: Date },
  fcExpiry: { type: Date }, // Fitness Certificate
  status: { type: String, enum: ['Active', 'Maintenance', 'Retired'], default: 'Active' },
  gpsDeviceId: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
