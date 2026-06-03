const Assignment = require('./assignment.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Create a new assignment (Faculty)
const createAssignment = async (req, res, next) => {
  try {
    const { title, description, facultyId, subjectId, batchId, dueDate, totalMarks, attachments } = req.body;

    const assignment = await Assignment.create({
      title, description, facultyId, subjectId, batchId, dueDate, totalMarks, attachments
    });

    return res.status(201).json(new ApiResponse(201, { assignment }, 'Assignment created successfully'));
  } catch (error) {
    next(error);
  }
};

// Get assignments for a batch/student
const getAssignments = async (req, res, next) => {
  try {
    const { batchId, subjectId, facultyId } = req.query;
    let filter = {};

    if (batchId) filter.batchId = batchId;
    if (subjectId) filter.subjectId = subjectId;
    if (facultyId) filter.facultyId = facultyId;

    const assignments = await Assignment.find(filter)
      .populate('facultyId', 'fullName')
      .populate('subjectId', 'name')
      .sort({ dueDate: 1 });

    return res.status(200).json(new ApiResponse(200, { assignments }, 'Assignments fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Submit an assignment (Student)
const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, content, attachments } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new ApiError(404, 'Assignment not found');
    }

    // Check if past due date
    const isLate = new Date() > new Date(assignment.dueDate);

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(s => s.studentId.toString() === studentId);
    if (existingSubmission) {
      // Update submission
      existingSubmission.content = content;
      existingSubmission.attachments = attachments;
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = isLate ? 'Late' : 'Submitted';
    } else {
      // New submission
      assignment.submissions.push({
        studentId,
        content,
        attachments,
        status: isLate ? 'Late' : 'Submitted'
      });
    }

    await assignment.save();
    return res.status(200).json(new ApiResponse(200, { assignment }, 'Assignment submitted successfully'));
  } catch (error) {
    next(error);
  }
};

// Grade an assignment (Faculty)
const gradeAssignment = async (req, res, next) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { marksAwarded, feedback } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    const submission = assignment.submissions.id(submissionId);
    if (!submission) throw new ApiError(404, 'Submission not found');

    if (marksAwarded > assignment.totalMarks) {
      throw new ApiError(400, `Marks awarded cannot exceed total marks (${assignment.totalMarks})`);
    }

    submission.marksAwarded = marksAwarded;
    submission.feedback = feedback;
    submission.status = 'Graded';

    await assignment.save();
    return res.status(200).json(new ApiResponse(200, { submission }, 'Submission graded successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeAssignment
};
