const Resource = require('./lms.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const uploadResource = async (req, res, next) => {
  try {
    const { title, description, type, url, subjectId, batchId, facultyId } = req.body;
    const resource = await Resource.create({ title, description, type, url, subjectId, batchId, facultyId, collegeId: req.user.collegeId });

    const Notification = require('../notifications/notification.model');
    const notification = await Notification.create({
      recipient: req.user._id,
      title: 'New Resource Uploaded',
      message: `${type || 'Material'} "${title}" has been successfully uploaded to the LMS.`,
      type: 'System',
      category: 'Academic',
      collegeId: req.user.collegeId
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('notification', notification);
    }

    return res.status(201).json(new ApiResponse(201, { resource }, 'Resource uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

const getResources = async (req, res, next) => {
  try {
    const { subjectId, batchId } = req.query;
    let filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (subjectId) filter.subjectId = subjectId;
    if (batchId) filter.batchId = batchId;

    const resources = await Resource.find(filter)
      .populate('subjectId', 'name code')
      .populate('facultyId', 'fullName')
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, { resources }, 'Resources fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) throw new ApiError(404, 'Resource not found');
    return res.status(200).json(new ApiResponse(200, {}, 'Resource deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResource,
  getResources,
  deleteResource
};
