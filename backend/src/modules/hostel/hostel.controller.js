const { Hostel, Room, HostelAllocation } = require('./hostel.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// --- Hostel & Room Management ---

const createHostel = async (req, res, next) => {
  try {
    const { name, type, address, warden } = req.body;
    const hostel = await Hostel.create({ name, type, address, warden, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, { hostel }, 'Hostel created successfully'));
  } catch (error) {
    next(error);
  }
};

const getHostels = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    const hostels = await Hostel.find(filter).populate('warden', 'fullName');
    return res.status(200).json(new ApiResponse(200, { hostels }, 'Hostels fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { hostelId, roomNumber, capacity, type, baseFee } = req.body;
    const room = await Room.create({ hostelId, roomNumber, capacity, type, baseFee, collegeId: req.user.collegeId });
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
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
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

    const allocation = await HostelAllocation.create({ studentId, roomId, startDate, collegeId: req.user.collegeId });
    
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

const getHostelDashboardStats = async (req, res, next) => {
  try {
    const isStudent = req.user.role.name === 'Student';
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;

    let stats = {};

    if (isStudent) {
      let studentId = req.user._id;
      try {
        const Student = require('../students/student.model');
        const student = await Student.findOne({ user: req.user._id });
        if (student) studentId = student._id;
      } catch (e) {}

      const allocation = await HostelAllocation.findOne({ studentId, status: 'Active' })
        .populate({
          path: 'roomId',
          populate: { path: 'hostelId' }
        });

      if (allocation && allocation.roomId && allocation.roomId.hostelId) {
        const room = allocation.roomId;
        const hostel = room.hostelId;
        
        let roommates = [];
        try {
          const roommatesAllocations = await HostelAllocation.find({ roomId: room._id, studentId: { $ne: studentId }, status: 'Active' }).populate('studentId', 'fullName');
          roommates = roommatesAllocations.map(ra => ra.studentId?.fullName || 'Unknown Student');
        } catch (e) {}

        let validUntil = new Date(allocation.startDate);
        validUntil.setFullYear(validUntil.getFullYear() + 1);

        stats = {
          studentAllocation: {
            hostel: hostel.name,
            roomNumber: room.roomNumber,
            roomType: room.type,
            bedNumber: roommates.length + 1,
            roommates: roommates,
            warden: hostel.warden || 'Unknown Warden',
            contact: '+1 234-567-8900', // Mock
            validUntil: validUntil.toLocaleDateString()
          }
        };
      } else {
        stats = { studentAllocation: null };
      }
    } else {
      const hostels = await Hostel.find(filter).lean();
      const hostelsStats = await Promise.all(hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostelId: hostel._id }).lean();
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.occupancy > 0).length;
        
        return {
          id: hostel._id,
          name: hostel.name,
          type: hostel.type,
          totalRooms,
          occupiedRooms,
          warden: hostel.warden || 'Unknown Warden',
          contact: '+1 234-567-8900'
        };
      }));

      stats = { hostels: hostelsStats };
    }

    return res.json(new ApiResponse(200, stats, 'Hostel dashboard stats fetched'));
  } catch (error) { next(error); }
};

module.exports = {
  createHostel,
  getHostels,
  createRoom,
  getRooms,
  allocateRoom,
  getStudentAllocation,
  getHostelDashboardStats
};
