const College = require('./college.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// GET all colleges
const getColleges = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user && req.user.role.name !== 'Super Admin') {
      filter._id = req.user.collegeId;
    }
    
    const colleges = await College.find(filter).sort({ name: 1 });
    return res.json(new ApiResponse(200, colleges, 'Colleges fetched'));
  } catch (error) { next(error); }
};

// GET single college
const getCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) throw new ApiError(404, 'College not found');
    
    if (req.user && req.user.role.name !== 'Super Admin' && req.user.collegeId.toString() !== college._id.toString()) {
      throw new ApiError(403, 'You do not have permission to view this college');
    }

    return res.json(new ApiResponse(200, college, 'College fetched'));
  } catch (error) { next(error); }
};

// POST create college
const createCollege = async (req, res, next) => {
  try {
    const { name, code, address, status } = req.body;
    if (!name || !code) throw new ApiError(400, 'Name and code are required');

    const exists = await College.findOne({ code: code.toUpperCase() });
    if (exists) throw new ApiError(400, 'College code already exists');

    const college = await College.create({
      name, code: code.toUpperCase(), address, status
    });

    return res.status(201).json(new ApiResponse(201, college, 'College created'));
  } catch (error) { next(error); }
};

// PUT update college
const updateCollege = async (req, res, next) => {
  try {
    if (req.user && req.user.role.name !== 'Super Admin' && req.user.collegeId.toString() !== req.params.id) {
       throw new ApiError(403, 'You do not have permission to update this college');
    }

    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!college) throw new ApiError(404, 'College not found');
    
    return res.json(new ApiResponse(200, college, 'College updated'));
  } catch (error) { next(error); }
};

// DELETE college
const deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) throw new ApiError(404, 'College not found');
    return res.json(new ApiResponse(200, null, 'College deleted'));
  } catch (error) { next(error); }
};

module.exports = { getColleges, getCollege, createCollege, updateCollege, deleteCollege };
