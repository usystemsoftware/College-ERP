const FeeCategory = require('./feeCategory.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, isOptional } = req.body;
    const collegeId = req.user.collegeId;

    if (!name) throw new ApiError(400, 'Category name is required');

    const exists = await FeeCategory.findOne({ name, collegeId });
    if (exists) throw new ApiError(400, 'Fee category already exists');

    const category = await FeeCategory.create({ name, description, isOptional, collegeId });
    return res.status(201).json(new ApiResponse(201, category, 'Fee category created successfully'));
  } catch (error) { next(error); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    const categories = await FeeCategory.find({ collegeId }).sort({ createdAt: -1 });
    return res.json(new ApiResponse(200, categories, 'Fee categories fetched'));
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, isOptional } = req.body;
    const category = await FeeCategory.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      { name, description, isOptional },
      { new: true, runValidators: true }
    );
    if (!category) throw new ApiError(404, 'Category not found');
    return res.json(new ApiResponse(200, category, 'Fee category updated'));
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await FeeCategory.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
    if (!category) throw new ApiError(404, 'Category not found');
    // Ideally we should check if it is used in any FeeStructure before deleting
    return res.json(new ApiResponse(200, null, 'Fee category deleted'));
  } catch (error) { next(error); }
};
