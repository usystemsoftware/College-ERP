const Timetable = require('./timetable.model');
const Student = require('../students/student.model');
const Notification = require('../notifications/notification.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getTimetable = async (req, res, next) => {
  try {
    const roleName = req.user.role.name;

    // ─── STUDENT: auto-filter by their enrolled dept/course/semester/division ───
    if (roleName === 'Student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) throw new ApiError(404, 'Student profile not found');

      const filter = {
        isActive: true,
        collegeId: req.user.collegeId,
        department: student.department,
        course: student.course,
        semester: student.semester,
        division: student.division,
      };

      const timetable = await Timetable.find(filter)
        .populate('subject', 'name code type')
        .populate('faculty', 'fullName employeeId')
        .populate('semester', 'name')
        .populate('department', 'name code')
        .sort({ dayOfWeek: 1, startTime: 1 });

      return res.json(new ApiResponse(200, timetable, 'Timetable fetched'));
    }

    // ─── ADMIN / FACULTY: filter by query params ───────────────────────────────
    const { semester, department, division, course, faculty } = req.query;
    const filter = { isActive: true };

    if (roleName !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (semester) filter.semester = semester;
    if (department) filter.department = department;
    if (division) filter.division = division;
    if (course) filter.course = course;
    if (faculty) filter.faculty = faculty;

    const timetable = await Timetable.find(filter)
      .populate('subject', 'name code type')
      .populate('faculty', 'fullName employeeId')
      .populate('semester', 'name')
      .populate('department', 'name code')
      .sort({ dayOfWeek: 1, startTime: 1 });

    return res.json(new ApiResponse(200, timetable, 'Timetable fetched'));
  } catch (error) { next(error); }
};

const createTimetableEntry = async (req, res, next) => {
  try {
    // Check for time conflict in same dept/division/semester on same day
    const { department, semester, division, dayOfWeek, startTime, faculty } = req.body;

    const conflict = await Timetable.findOne({
      department,
      semester,
      division,
      dayOfWeek,
      startTime,
      isActive: true,
    });
    if (conflict) {
      throw new ApiError(400, `A class is already scheduled at ${startTime} on ${dayOfWeek} for this division`);
    }

    // Faculty double-booking check
    if (faculty) {
      const facultyConflict = await Timetable.findOne({
        faculty,
        dayOfWeek,
        startTime,
        isActive: true,
      });
      if (facultyConflict) {
        throw new ApiError(400, `This faculty is already assigned to another class at ${startTime} on ${dayOfWeek}`);
      }
    }

    const entry = await Timetable.create({ ...req.body, collegeId: req.user.collegeId });

    // Notify all students in the assigned department/course/semester/division
    const { course, division: div } = req.body;
    const affectedStudents = await Student.find({
      department,
      course,
      semester,
      division: div,
      collegeId: req.user.collegeId,
    }).select('user');

    const io = req.app.get('io');

    const populatedEntry = await Timetable.findById(entry._id)
      .populate('subject', 'name')
      .populate('department', 'name')
      .populate('semester', 'name');

    const notificationMessage = `New class scheduled: ${populatedEntry.subject?.name || 'A subject'} on ${dayOfWeek} at ${startTime} (${populatedEntry.department?.name || 'your department'})`;

    for (const s of affectedStudents) {
      const notification = await Notification.create({
        recipient: s.user,
        title: 'Timetable Updated',
        message: notificationMessage,
        type: 'System',
        category: 'Academic',
        collegeId: req.user.collegeId,
      });
      if (io) {
        io.to(s.user.toString()).emit('notification', notification);
      }
    }

    return res.status(201).json(new ApiResponse(201, entry, 'Timetable entry created'));
  } catch (error) { next(error); }
};

const updateTimetableEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entry) throw new ApiError(404, 'Timetable entry not found');
    return res.json(new ApiResponse(200, entry, 'Timetable entry updated'));
  } catch (error) { next(error); }
};

const deleteTimetableEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) throw new ApiError(404, 'Entry not found');
    return res.json(new ApiResponse(200, null, 'Timetable entry deleted'));
  } catch (error) { next(error); }
};

module.exports = { getTimetable, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry };
