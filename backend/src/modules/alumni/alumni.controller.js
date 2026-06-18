const Alumni = require('./alumni.model');
const Student = require('../students/student.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// GET all alumni
const getAllAlumni = async (req, res, next) => {
  try {
    const { industry, graduationYear, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (industry) filter.industry = industry;
    if (graduationYear) filter.graduationYear = graduationYear;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [alumniList, total] = await Promise.all([
      Alumni.find(filter)
        .populate({
          path: 'student',
          select: 'rollNumber personalDetails.fullName course department',
          populate: [
            { path: 'course', select: 'name' },
            { path: 'department', select: 'name' }
          ]
        })
        .sort({ graduationYear: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Alumni.countDocuments(filter)
    ]);

    return res.json(new ApiResponse(200, {
      alumniList, 
      pagination: { total, pages: Math.ceil(total / parseInt(limit)) }
    }, 'Alumni fetched'));
  } catch (error) { next(error); }
};

// CREATE or UPDATE Alumni profile
const createOrUpdateAlumni = async (req, res, next) => {
  try {
    const { studentId, graduationYear, currentCompany, designation, industry, linkedinUrl } = req.body;
    const student = await Student.findById(studentId);
    if (!student) throw new ApiError(404, 'Student not found');

    // Ensure only admins or the student themselves can update their alumni profile
    if (req.user.role.name === 'Student') {
      const loggedInStudent = await Student.findOne({ user: req.user._id });
      if (!loggedInStudent || loggedInStudent._id.toString() !== studentId) {
        throw new ApiError(403, 'Unauthorized to create alumni profile for this student');
      }
    }

    let alumni = await Alumni.findOne({ student: studentId });

    if (alumni) {
      alumni.graduationYear = graduationYear || alumni.graduationYear;
      alumni.currentCompany = currentCompany || alumni.currentCompany;
      alumni.designation = designation || alumni.designation;
      alumni.industry = industry || alumni.industry;
      alumni.linkedinUrl = linkedinUrl || alumni.linkedinUrl;
      await alumni.save();
      return res.status(200).json(new ApiResponse(200, alumni, 'Alumni profile updated'));
    } else {
      alumni = await Alumni.create({
        student: studentId,
        graduationYear,
        currentCompany,
        designation,
        industry,
        linkedinUrl,
        collegeId: student.collegeId
      });
      return res.status(201).json(new ApiResponse(201, alumni, 'Alumni profile created'));
    }
  } catch (error) { next(error); }
};

// GET my Alumni profile (for logged in students who are alumni)
const getMyAlumniProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) throw new ApiError(404, 'Student profile not found');

    const alumni = await Alumni.findOne({ student: student._id }).populate('student', 'personalDetails.fullName');
    return res.json(new ApiResponse(200, alumni || null, 'Alumni profile fetched'));
  } catch (error) { next(error); }
};

module.exports = { getAllAlumni, createOrUpdateAlumni, getMyAlumniProfile };
