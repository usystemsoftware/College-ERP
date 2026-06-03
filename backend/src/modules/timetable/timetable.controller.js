const Timetable = require('./timetable.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Get timetables with filters
const getTimetables = async (req, res, next) => {
  try {
    const { departmentId, courseId, batchId, semesterId } = req.query;
    let filter = {};
    if (departmentId) filter.departmentId = departmentId;
    if (courseId) filter.courseId = courseId;
    if (batchId) filter.batchId = batchId;
    if (semesterId) filter.semesterId = semesterId;

    // Students should only see published timetables
    if (req.user && req.user.role && req.user.role.name === 'Student') {
      filter.published = true;
      // Ideally, further restrict to student's own batch/semester
    }

    const timetables = await Timetable.find(filter)
      .populate('departmentId', 'name')
      .populate('courseId', 'name')
      .populate('batchId', 'name')
      .populate('slots.facultyId', 'fullName employeeId');

    return res.status(200).json(new ApiResponse(200, { timetables }, 'Timetables fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Create or update a timetable
const saveTimetable = async (req, res, next) => {
  try {
    const { departmentId, courseId, batchId, semesterId, slots, published } = req.body;

    // Basic Conflict Detection
    // For every slot being added, check if the faculty is already assigned at the same day & time
    if (slots && slots.length > 0) {
      for (const slot of slots) {
        if (slot.facultyId) {
          const conflict = await Timetable.findOne({
            _id: { $ne: req.body._id }, // exclude current timetable if updating
            isActive: true,
            slots: {
              $elemMatch: {
                facultyId: slot.facultyId,
                dayOfWeek: slot.dayOfWeek,
                // Simple exact match collision. A robust engine would do range checks on startTime/endTime
                startTime: slot.startTime, 
                endTime: slot.endTime
              }
            }
          });

          if (conflict) {
             throw new ApiError(409, `Conflict Detected: Faculty is already booked on ${slot.dayOfWeek} from ${slot.startTime} to ${slot.endTime} in another batch.`);
          }
        }
      }
    }

    // Upsert logic based on batch+semester combo
    let timetable = await Timetable.findOne({ departmentId, courseId, batchId, semesterId });
    
    if (timetable) {
      timetable.slots = slots || timetable.slots;
      timetable.published = published !== undefined ? published : timetable.published;
      await timetable.save();
    } else {
      timetable = await Timetable.create({
        departmentId, courseId, batchId, semesterId, slots, published
      });
    }

    return res.status(200).json(new ApiResponse(200, { timetable }, 'Timetable saved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimetables,
  saveTimetable
};
