const Batch = require('./batch.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getBatches = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const filter = courseId ? { courseId } : {};
    
    // We could add collegeId filtering if Batch model had it, but currently it only references Course.
    // Course belongs to Department which belongs to College.
    
    const batches = await Batch.find(filter).populate('courseId', 'name code');
    return res.json(new ApiResponse(200, batches, 'Batches fetched'));
  } catch (error) { next(error); }
};

const createBatch = async (req, res, next) => {
  try {
    const { name, courseId, startYear, endYear, isActive } = req.body;
    if (!name || !courseId || !startYear || !endYear) throw new ApiError(400, 'Name, course, start year and end year are required');
    
    const batch = await Batch.create({ name, courseId, startYear, endYear, isActive: isActive !== undefined ? isActive : true });
    return res.status(201).json(new ApiResponse(201, batch, 'Batch created'));
  } catch (error) { next(error); }
};

const updateBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!batch) throw new ApiError(404, 'Batch not found');
    return res.json(new ApiResponse(200, batch, 'Batch updated'));
  } catch (error) { next(error); }
};

const deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) throw new ApiError(404, 'Batch not found');
    return res.json(new ApiResponse(200, null, 'Batch deleted'));
  } catch (error) { next(error); }
};

module.exports = { getBatches, createBatch, updateBatch, deleteBatch };
