const Exam = require('./exam.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Create an exam event
const createExam = async (req, res, next) => {
  try {
    const { title, examType, subjectId, batchId, date, totalMarks, passingMarks } = req.body;

    const exam = await Exam.create({
      title, examType, subjectId, batchId, date, totalMarks, passingMarks, collegeId: req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, { exam }, 'Exam created successfully'));
  } catch (error) {
    next(error);
  }
};

// Get exams for a batch/subject
const getExams = async (req, res, next) => {
  try {
    const { batchId, subjectId } = req.query;
    let filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;

    if (batchId) filter.batchId = batchId;
    if (subjectId) filter.subjectId = subjectId;

    // Students only see published results (or maybe exams without results)
    if (req.user && req.user.role && req.user.role.name === 'Student') {
       // Filter logic for student view could go here
    }

    const exams = await Exam.find(filter)
      .populate('subjectId', 'name code')
      .populate('batchId', 'name')
      .sort({ date: 1 });

    return res.status(200).json(new ApiResponse(200, { exams }, 'Exams fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Add/Update results for an exam
const updateResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { results, isPublished } = req.body;

    const exam = await Exam.findById(id);
    if (!exam) throw new ApiError(404, 'Exam not found');

    if (results) {
      exam.results = results;
    }
    
    if (isPublished !== undefined) {
      exam.isPublished = isPublished;
    }

    await exam.save();

    return res.status(200).json(new ApiResponse(200, { exam }, 'Exam results updated successfully'));
  } catch (error) {
    next(error);
  }
};

// Get student specific results
const getStudentResults = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const exams = await Exam.find({ 'results.studentId': studentId, isPublished: true })
      .populate('subjectId', 'name code');

    const formattedResults = exams.map(exam => {
      const studentResult = exam.results.find(r => r.studentId.toString() === studentId);
      return {
        _id: exam._id,
        examTitle: exam.title,
        examType: exam.examType,
        date: exam.date,
        subject: exam.subjectId,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        marksObtained: studentResult.marksObtained,
        grade: studentResult.grade,
        remarks: studentResult.remarks
      };
    });

    return res.status(200).json(new ApiResponse(200, { results: formattedResults }, 'Student results fetched successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  getExams,
  updateResults,
  getStudentResults
};
