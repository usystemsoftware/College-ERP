const Note = require('./note.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const pick = require('../../utils/pick');

const getNotes = async (req, res, next) => {
  try {
    const filter = { isVisible: true, collegeId: req.user.collegeId };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.fileType) filter.fileType = req.query.fileType;

    const notes = await Note.find(filter)
      .populate('subject', 'name code')
      .populate('uploadedBy', 'email')
      .populate('faculty', 'fullName')
      .sort({ createdAt: -1 });

    return res.json(new ApiResponse(200, notes, 'Notes fetched'));
  } catch (error) { next(error); }
};

const createNote = async (req, res, next) => {
  try {
    const { title, subject, fileUrl, fileType, description, chapter, semester } = req.body;
    if (!title || !subject || !fileUrl || !fileType) throw new ApiError(400, 'Title, subject, fileUrl and fileType are required');

    const faculty = await require('../faculty/faculty.model').findOne({ user: req.user._id });

    const note = await Note.create({
      title, description, subject, chapter, fileUrl, fileType, semester,
      uploadedBy: req.user._id,
      faculty: faculty?._id,
      collegeId: req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, note, 'Note uploaded'));
  } catch (error) { next(error); }
};

const updateNote = async (req, res, next) => {
  try {
    const allowedUpdates = pick(req.body, ['title', 'subject', 'fileUrl', 'fileType', 'description', 'chapter', 'semester']);
    const note = await Note.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true });
    if (!note) throw new ApiError(404, 'Note not found');
    return res.json(new ApiResponse(200, note, 'Note updated'));
  } catch (error) { next(error); }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) throw new ApiError(404, 'Note not found');
    return res.json(new ApiResponse(200, null, 'Note deleted'));
  } catch (error) { next(error); }
};

const incrementDownload = async (req, res, next) => {
  try {
    await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    return res.json(new ApiResponse(200, null, 'Download recorded'));
  } catch (error) { next(error); }
};

module.exports = { getNotes, createNote, updateNote, deleteNote, incrementDownload };
