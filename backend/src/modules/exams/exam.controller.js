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

// Get my own results (student self-service)
const getMyResults = async (req, res, next) => {
  try {
    const Student = require('../students/student.model');
    const student = await Student.findOne({ user: req.user._id });
    if (!student) throw new ApiError(404, 'Student profile not found');

    const studentId = student._id.toString();

    const exams = await Exam.find({ 'results.studentId': student._id, isPublished: true })
      .populate('subjectId', 'name code');

    const formattedResults = exams.map(exam => {
      const studentResult = exam.results.find(r => r.studentId.toString() === studentId);
      if (!studentResult) return null;

      const percentage = exam.totalMarks > 0 ? ((studentResult.marksObtained / exam.totalMarks) * 100).toFixed(1) : 0;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';

      return {
        _id: exam._id,
        examTitle: exam.title,
        examType: exam.examType,
        date: exam.date,
        subject: exam.subjectId,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        marksObtained: studentResult.marksObtained,
        grade: studentResult.grade || grade,
        percentage: parseFloat(percentage),
        passed: studentResult.marksObtained >= (exam.passingMarks || 0),
        remarks: studentResult.remarks
      };
    }).filter(Boolean);

    // Summary stats
    const totalExams = formattedResults.length;
    const passedExams = formattedResults.filter(r => r.passed).length;
    const avgPercentage = totalExams > 0 ? (formattedResults.reduce((sum, r) => sum + r.percentage, 0) / totalExams).toFixed(1) : 0;

    return res.status(200).json(new ApiResponse(200, {
      results: formattedResults,
      summary: {
        totalExams,
        passedExams,
        failedExams: totalExams - passedExams,
        averagePercentage: parseFloat(avgPercentage)
      }
    }, 'My results fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const getExamDashboardStats = async (req, res, next) => {
  try {
    const isStudent = req.user.role.name === 'Student';
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;

    let examsList = [];

    if (isStudent) {
      let studentId = req.user._id;
      try {
        const Student = require('../students/student.model');
        const student = await Student.findOne({ user: req.user._id });
        if (student) studentId = student._id;
      } catch (e) {}

      const allExams = await Exam.find(filter)
        .populate('subjectId', 'name')
        .sort({ date: -1 })
        .limit(20)
        .lean();

      examsList = allExams.map(ex => {
        let status = 'Upcoming';
        const now = new Date();
        const examDate = new Date(ex.date);
        
        if (ex.isPublished) status = 'Published';
        else if (examDate < now) status = 'Evaluating';

        let score = null;
        if (status === 'Published' && ex.results) {
          const res = ex.results.find(r => r.studentId.toString() === studentId.toString());
          if (res) score = res.marksObtained;
        }

        return {
          id: ex._id,
          title: ex.title,
          subject: ex.subjectId ? ex.subjectId.name : 'Unknown Subject',
          date: examDate.toLocaleDateString(),
          status: status,
          marks: ex.totalMarks,
          score: score
        };
      });

    } else {
      const allExams = await Exam.find(filter)
        .populate('subjectId', 'name')
        .sort({ date: -1 })
        .limit(20)
        .lean();

      examsList = allExams.map(ex => {
        let status = 'Upcoming';
        const now = new Date();
        const examDate = new Date(ex.date);
        
        if (ex.isPublished) status = 'Published';
        else if (examDate < now) status = 'Evaluating';

        return {
          id: ex._id,
          title: ex.title,
          subject: ex.subjectId ? ex.subjectId.name : 'Unknown Subject',
          date: examDate.toLocaleDateString(),
          status: status,
          marks: ex.totalMarks
        };
      });
    }

    return res.json(new ApiResponse(200, examsList, 'Exam dashboard stats fetched'));
  } catch (error) { next(error); }
};

module.exports = {
  createExam,
  getExams,
  updateResults,
  getStudentResults,
  getMyResults,
  getExamDashboardStats
};
