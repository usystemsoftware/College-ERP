const mongoose = require('mongoose');

const transportRouteSchema = new mongoose.Schema({
  routeName: { type: String, required: true, trim: true },
  routeCode: { type: String, required: true, unique: true, uppercase: true },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  stops: [{
    stopName: { type: String, required: true },
    time: { type: String, required: true }, // '08:15'
    latitude: { type: Number },
    longitude: { type: Number }
  }],
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  feePerMonth: { type: Number, required: true },
  feePerSemester: { type: Number, required: true },
  totalCapacity: { type: Number },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

transportRouteSchema.index({ collegeId: 1, status: 1 });

module.exports = mongoose.model('TransportRoute', transportRouteSchema);
