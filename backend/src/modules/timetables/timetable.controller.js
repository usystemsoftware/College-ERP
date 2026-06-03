const Timetable = require('./timetable.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getTimetable = async (req, res, next) => {
  try {
    const { semester, department, division, faculty } = req.query;
    const filter = { isActive: true };
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (semester) filter.semester = semester;
    if (department) filter.department = department;
    if (division) filter.division = division;
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
    const entry = await Timetable.create({ ...req.body, collegeId: req.user.collegeId });
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
