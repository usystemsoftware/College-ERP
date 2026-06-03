const Asset = require('./inventory.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const addAsset = async (req, res, next) => {
  try {
    const { itemName, category, quantity, location, purchaseDate, cost, status } = req.body;
    const asset = await Asset.create({ itemName, category, quantity, location, purchaseDate, cost, status, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, { asset }, 'Asset added successfully'));
  } catch (error) {
    next(error);
  }
};

const getAssets = async (req, res, next) => {
  try {
    const { category, location, status } = req.query;
    let filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (status) filter.status = status;

    const assets = await Asset.find(filter).sort({ itemName: 1 });
    return res.status(200).json(new ApiResponse(200, { assets }, 'Assets fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const asset = await Asset.findByIdAndUpdate(id, updateData, { new: true });
    if (!asset) throw new ApiError(404, 'Asset not found');

    return res.status(200).json(new ApiResponse(200, { asset }, 'Asset updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addAsset,
  getAssets,
  updateAsset
};
