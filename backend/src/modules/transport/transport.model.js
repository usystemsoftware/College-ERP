const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  pickupTime: { type: String, required: true }, // e.g., "07:30 AM"
  dropTime: { type: String }, // e.g., "05:30 PM"
  distanceFromCampus: { type: Number }, // In km
  baseFee: { type: Number, required: true } // Fee for this specific stop
});

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true }, // e.g., "Route 1 - City Center"
  stops: [stopSchema],
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true }, // License plate
  capacity: { type: Number, required: true },
  driverName: { type: String, required: true },
  driverContact: { type: String, required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' }, // Assigned route
  gpsDevice: {
    deviceId: { type: String },
    lastLat: { type: Number },
    lastLng: { type: Number },
    lastUpdated: { type: Date }
  },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

const transportAllocationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  stopId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Specific stop inside the route
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  startDate: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

const Route = mongoose.model('Route', routeSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
const TransportAllocation = mongoose.model('TransportAllocation', transportAllocationSchema);

module.exports = { Route, Vehicle, TransportAllocation };
