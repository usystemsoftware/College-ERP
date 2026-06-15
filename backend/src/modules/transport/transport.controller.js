const { Route, Vehicle, TransportAllocation } = require('./transport.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// --- Route Management ---
const createRoute = async (req, res, next) => {
  try {
    const { routeName, stops } = req.body;
    const route = await Route.create({ routeName, stops, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, { route }, 'Route created successfully'));
  } catch (error) {
    next(error);
  }
};

const getRoutes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    const routes = await Route.find(filter).sort({ routeName: 1 });
    return res.status(200).json(new ApiResponse(200, { routes }, 'Routes fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// --- Vehicle Management ---
const addVehicle = async (req, res, next) => {
  try {
    const { vehicleNumber, capacity, driverName, driverContact, routeId } = req.body;
    const vehicle = await Vehicle.create({ vehicleNumber, capacity, driverName, driverContact, routeId, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, { vehicle }, 'Vehicle added successfully'));
  } catch (error) {
    if (error.code === 11000) {
      next(new ApiError(400, 'Vehicle number already exists'));
    } else {
      next(error);
    }
  }
};

const getVehicles = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    const vehicles = await Vehicle.find(filter).populate('routeId', 'routeName');
    return res.status(200).json(new ApiResponse(200, { vehicles }, 'Vehicles fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// --- Allocation Management ---
const allocateTransport = async (req, res, next) => {
  try {
    const { studentId, routeId, stopId, vehicleId, startDate, generateInvoice } = req.body;

    // Verify Vehicle capacity
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');

    const currentAllocationsCount = await TransportAllocation.countDocuments({ vehicleId, status: 'Active' });
    if (currentAllocationsCount >= vehicle.capacity) {
      throw new ApiError(400, 'Vehicle is at full capacity');
    }

    // Verify Route & Stop
    const route = await Route.findById(routeId);
    if (!route) throw new ApiError(404, 'Route not found');
    
    const stop = route.stops.id(stopId);
    if (!stop) throw new ApiError(404, 'Stop not found in this route');

    const allocation = await TransportAllocation.create({
      studentId, routeId, stopId, vehicleId, startDate, collegeId: req.user.collegeId
    });

    if (generateInvoice) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);
      const activeYear = await require('../academicYears/academicYear.model').findOne({ isCurrent: true });
      if (activeYear) {
        await require('../fees/fee.model').create({
          student: studentId,
          academicYear: activeYear._id,
          title: `Transport Fee - ${route.routeName}`,
          totalAmount: stop.baseFee,
          installments: [{
            amount: stop.baseFee,
            dueDate: dueDate,
            status: 'Unpaid'
          }],
          status: 'Unpaid',
          generatedBy: req.user._id,
          collegeId: req.user.collegeId
        });
      }
    }

    return res.status(201).json(new ApiResponse(201, { allocation }, 'Transport allocated successfully'));
  } catch (error) {
    if (error.code === 11000) {
       next(new ApiError(400, 'Student already has an active transport allocation'));
    } else {
       next(error);
    }
  }
};

const getStudentTransport = async (req, res, next) => {
  try {
    const studentId = (req.user && req.user.role && req.user.role.name === 'Student') ? req.user._id : req.params.studentId;
    
    const allocation = await TransportAllocation.findOne({ studentId, status: 'Active' })
      .populate('routeId')
      .populate('vehicleId', 'vehicleNumber driverName driverContact');

    return res.status(200).json(new ApiResponse(200, { allocation }, 'Transport allocation fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const getTransportDashboardStats = async (req, res, next) => {
  try {
    const isStudent = req.user.role.name === 'Student';
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;

    let stats = {};

    if (isStudent) {
      let studentId = req.user._id; // Fallback if no student profile yet
      try {
        const Student = require('../students/student.model');
        const student = await Student.findOne({ user: req.user._id });
        if (student) studentId = student._id;
      } catch (e) {}

      const allocation = await TransportAllocation.findOne({ studentId, status: 'Active' })
        .populate('routeId')
        .populate('vehicleId');
      
      if (allocation && allocation.routeId && allocation.vehicleId) {
        const stop = allocation.routeId.stops.id(allocation.stopId);
        stats = {
          studentTransport: {
            route: allocation.routeId.routeName,
            stop: stop ? stop.stopName : 'Unknown',
            pickupTime: stop ? stop.pickupTime : 'N/A',
            dropTime: stop ? stop.dropTime : 'N/A',
            vehicleNumber: allocation.vehicleId.vehicleNumber,
            driverName: allocation.vehicleId.driverName,
            driverContact: allocation.vehicleId.driverContact
          }
        };
      } else {
        // Fallback mock if not allocated so dashboard isn't completely empty
        stats = { studentTransport: { route: 'Unassigned', stop: 'N/A', pickupTime: '-', dropTime: '-', vehicleNumber: '-', driverName: '-', driverContact: '-' } };
      }
    } else {
      // Admin View
      const routes = await Route.find(filter).lean();
      
      const routeStats = await Promise.all(routes.map(async (route) => {
        const vehiclesCount = await Vehicle.countDocuments({ routeId: route._id });
        const studentsCount = await TransportAllocation.countDocuments({ routeId: route._id, status: 'Active' });
        
        const vehicles = await Vehicle.find({ routeId: route._id }).lean();
        const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);

        return {
          id: route._id,
          name: route.routeName,
          stops: route.stops ? route.stops.length : 0,
          vehicles: vehiclesCount,
          students: studentsCount,
          capacity: totalCapacity > 0 ? totalCapacity : 50
        };
      }));

      stats = { routes: routeStats };
    }

    return res.json(new ApiResponse(200, stats, 'Transport dashboard stats fetched'));
  } catch (error) { next(error); }
};

// Real-time tracking: Get all live bus locations
const getBusLiveLocations = async (req, res, next) => {
  try {
    const filter = { 'gpsDevice.lastLat': { $exists: true } };
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;

    const vehicles = await Vehicle.find(filter)
      .select('vehicleNumber driverName gpsDevice routeId')
      .populate('routeId', 'routeName');

    const liveData = vehicles.map(v => ({
      vehicleId: v._id,
      vehicleNumber: v.vehicleNumber,
      driverName: v.driverName,
      routeName: v.routeId ? v.routeId.routeName : 'Unassigned',
      lat: v.gpsDevice.lastLat,
      lng: v.gpsDevice.lastLng,
      lastUpdated: v.gpsDevice.lastUpdated
    }));

    return res.json(new ApiResponse(200, liveData, 'Live bus locations fetched'));
  } catch (error) { next(error); }
};

// Real-time tracking: Estimate ETA for a student's assigned stop
const getBusETA = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { studentId } = req.query; // If querying for a specific student's ETA

    const vehicle = await Vehicle.findById(vehicleId).populate('routeId');
    if (!vehicle || !vehicle.gpsDevice || !vehicle.gpsDevice.lastLat) {
      throw new ApiError(404, 'Vehicle location not available');
    }

    // Mock ETA calculation based on distance
    // In a real app, this would use Google Distance Matrix API
    let etaMinutes = 15; // default fallback
    let distanceKm = 5;
    let stopName = 'Your Stop';

    if (studentId && vehicle.routeId) {
      const allocation = await TransportAllocation.findOne({ studentId, vehicleId });
      if (allocation) {
        const stop = vehicle.routeId.stops.id(allocation.stopId);
        if (stop && stop.distanceFromCampus) {
          // Very rough mock: 1km = 3 mins bus ride
          distanceKm = stop.distanceFromCampus;
          etaMinutes = Math.round(distanceKm * 3);
          stopName = stop.stopName;
        }
      }
    }

    return res.json(new ApiResponse(200, {
      vehicleNumber: vehicle.vehicleNumber,
      currentLat: vehicle.gpsDevice.lastLat,
      currentLng: vehicle.gpsDevice.lastLng,
      etaMinutes,
      distanceKm,
      stopName,
      lastUpdated: vehicle.gpsDevice.lastUpdated
    }, 'ETA calculated'));
  } catch (error) { next(error); }
};

module.exports = {
  createRoute,
  getRoutes,
  addVehicle,
  getVehicles,
  allocateTransport,
  getStudentTransport,
  getTransportDashboardStats,
  getBusLiveLocations,
  getBusETA
};
