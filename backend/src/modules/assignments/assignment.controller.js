const Assignment = require('./assignment.model');
const Submission = require('./submission.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// GET assignments
const getAssignments = async (req, res, next) => {
  try {
    const filter = { isActive: true, collegeId: req.user.collegeId };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.department) filter.department = req.query.department;

    const assignments = await Assignment.find(filter)
      .populate('subject', 'name code')
      .populate('faculty', 'fullName')
      .sort({ dueDate: 1 });
    return res.json(new ApiResponse(200, assignments, 'Assignments fetched'));
  } catch (error) { next(error); }
};

const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('faculty', 'fullName');
    if (!assignment) throw new ApiError(404, 'Assignment not found');
    return res.json(new ApiResponse(200, assignment, 'Assignment fetched'));
  } catch (error) { next(error); }
};

const createAssignment = async (req, res, next) => {
  try {
    const faculty = await require('../faculty/faculty.model').findOne({ user: req.user._id });
    const assignment = await Assignment.create({
      ...req.body,
      createdBy: req.user._id,
      faculty: faculty?._id,
      collegeId: req.user.collegeId
    });
    return res.status(201).json(new ApiResponse(201, assignment, 'Assignment created'));
  } catch (error) { next(error); }
};

const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assignment) throw new ApiError(404, 'Assignment not found');
    return res.json(new ApiResponse(200, assignment, 'Assignment updated'));
  } catch (error) { next(error); }
};

const deleteAssignment = async (req, res, next) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    return res.json(new ApiResponse(200, null, 'Assignment deleted'));
  } catch (error) { next(error); }
};

// SUBMIT assignment
const submitAssignment = async (req, res, next) => {
  try {
    const { submittedUrl } = req.body;
    if (!submittedUrl) throw new ApiError(400, 'Submission file URL required');
    const student = await require('../students/student.model').findOne({ user: req.user._id });
    if (!student) throw new ApiError(403, 'Student profile not found');

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    const isLate = new Date() > assignment.dueDate;

    const submission = await Submission.findOneAndUpdate(
      { assignment: req.params.id, student: student._id },
      { submittedUrl, status: isLate ? 'Late' : 'Submitted', submittedAt: new Date(), collegeId: req.user.collegeId },
      { upsert: true, new: true }
    );

    return res.status(201).json(new ApiResponse(201, submission, isLate ? 'Submitted (Late)' : 'Submitted successfully'));
  } catch (error) { next(error); }
};

// GET submissions for an assignment (faculty view)
const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'rollNumber personalDetails.fullName')
      .sort({ submittedAt: 1 });
    return res.json(new ApiResponse(200, submissions, 'Submissions fetched'));
  } catch (error) { next(error); }
};

// GRADE a submission
const gradeSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(req.params.subId, {
      marks, feedback, status: 'Graded', gradedBy: req.user._id, gradedAt: new Date()
    }, { new: true });
    if (!submission) throw new ApiError(404, 'Submission not found');
    return res.json(new ApiResponse(200, submission, 'Submission graded'));
  } catch (error) { next(error); }
};

module.exports = { getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment, submitAssignment, getSubmissions, gradeSubmission };
