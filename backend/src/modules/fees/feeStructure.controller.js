const FeeStructure = require('./feeStructure.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

exports.createStructure = async (req, res, next) => {
  try {
    const { name, course, batch, academicYear, heads } = req.body;
    const collegeId = req.user.collegeId;

    if (!name || !course || !batch || !academicYear || !heads || !heads.length) {
      throw new ApiError(400, 'All fields are required and heads must not be empty');
    }

    const structure = await FeeStructure.create({
      name, course, batch, academicYear, heads, collegeId
    });

    return res.status(201).json(new ApiResponse(201, structure, 'Fee structure created successfully'));
  } catch (error) { next(error); }
};

exports.getStructures = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    const { course, batch, academicYear } = req.query;
    
    const filter = { collegeId };
    if (course) filter.course = course;
    if (batch) filter.batch = batch;
    if (academicYear) filter.academicYear = academicYear;

    const structures = await FeeStructure.find(filter)
      .populate('course', 'name')
      .populate('batch', 'name')
      .populate('academicYear', 'name')
      .populate('heads.category', 'name isOptional')
      .sort({ createdAt: -1 });

    return res.json(new ApiResponse(200, structures, 'Fee structures fetched'));
  } catch (error) { next(error); }
};

exports.getStructureById = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findOne({ _id: req.params.id, collegeId: req.user.collegeId })
      .populate('course', 'name')
      .populate('batch', 'name')
      .populate('academicYear', 'name')
      .populate('heads.category', 'name isOptional');
      
    if (!structure) throw new ApiError(404, 'Structure not found');
    return res.json(new ApiResponse(200, structure, 'Fee structure fetched'));
  } catch (error) { next(error); }
};

exports.updateStructure = async (req, res, next) => {
  try {
    const { name, heads } = req.body;
    
    const structure = await FeeStructure.findOne({ _id: req.params.id, collegeId: req.user.collegeId });
    if (!structure) throw new ApiError(404, 'Structure not found');

    if (name) structure.name = name;
    if (heads) structure.heads = heads;
    // .pre('save') hook will recalculate totalAmount
    await structure.save();

    return res.json(new ApiResponse(200, structure, 'Fee structure updated'));
  } catch (error) { next(error); }
};

exports.deleteStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
    if (!structure) throw new ApiError(404, 'Structure not found');
    return res.json(new ApiResponse(200, null, 'Fee structure deleted'));
  } catch (error) { next(error); }
};
