const { Hostel, Room, HostelAllocation } = require('./hostel.model');
const Invoice = require('../fees/fees.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// --- Hostel & Room Management ---

const createHostel = async (req, res, next) => {
  try {
    const { name, type, address, warden } = req.body;
    const hostel = await Hostel.create({ name, type, address, warden });
    return res.status(201).json(new ApiResponse(201, { hostel }, 'Hostel created successfully'));
  } catch (error) {
    next(error);
  }
};

const getHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find().populate('warden', 'fullName');
    return res.status(200).json(new ApiResponse(200, { hostels }, 'Hostels fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { hostelId, roomNumber, capacity, type, baseFee } = req.body;
    const room = await Room.create({ hostelId, roomNumber, capacity, type, baseFee });
    return res.status(201).json(new ApiResponse(201, { room }, 'Room created successfully'));
  } catch (error) {
    if (error.code === 11000) {
      next(new ApiError(400, 'Room number already exists in this hostel'));
    } else {
      next(error);
    }
  }
};

const getRooms = async (req, res, next) => {
  try {
    const { hostelId } = req.query;
    let filter = {};
    if (hostelId) filter.hostelId = hostelId;

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    return res.status(200).json(new ApiResponse(200, { rooms }, 'Rooms fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// --- Allocation Management ---

const allocateRoom = async (req, res, next) => {
  try {
    const { studentId, roomId, startDate, generateInvoice } = req.body;

    const room = await Room.findById(roomId);
    if (!room) throw new ApiError(404, 'Room not found');

    if (room.occupancy >= room.capacity) {
      throw new ApiError(400, 'Room is at full capacity');
    }

    // Check if student is already allocated a room
    const existingAllocation = await HostelAllocation.findOne({ studentId, status: 'Active' });
    if (existingAllocation) {
      throw new ApiError(400, 'Student is already allocated a room');
    }

    const allocation = await HostelAllocation.create({ studentId, roomId, startDate });
    
    // Increment occupancy
    room.occupancy += 1;
    await room.save();

    // Optionally generate invoice
    if (generateInvoice) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days
      await Invoice.create({
        studentId,
        title: `Hostel Fee - ${room.roomNumber}`,
        totalAmount: room.baseFee,
        dueDate,
        feeType: 'Hostel'
      });
    }

    return res.status(201).json(new ApiResponse(201, { allocation }, 'Room allocated successfully'));
  } catch (error) {
    if (error.code === 11000) {
       next(new ApiError(400, 'Student already has an active allocation (Unique constraint)'));
    } else {
       next(error);
    }
  }
};

const getStudentAllocation = async (req, res, next) => {
  try {
    // If student role, force use own ID
    const studentId = (req.user && req.user.role && req.user.role.name === 'Student') ? req.user._id : req.params.studentId;
    
    // NOTE: In a real app, you'd map req.user._id to the Student profile ID first. 
    // Here we're assuming the student profile ID is passed or handled correctly.

    const allocation = await HostelAllocation.findOne({ studentId, status: 'Active' })
      .populate({
        path: 'roomId',
        populate: { path: 'hostelId' }
      });

    return res.status(200).json(new ApiResponse(200, { allocation }, 'Allocation fetched successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHostel,
  getHostels,
  createRoom,
  getRooms,
  allocateRoom,
  getStudentAllocation
};
