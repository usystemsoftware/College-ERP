const Event = require('./event.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getEvents = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(filter).populate('organizer', 'email').sort({ startDate: -1 }).skip(skip).limit(parseInt(limit)),
      Event.countDocuments(filter)
    ]);
    return res.json(new ApiResponse(200, { events, pagination: { total, pages: Math.ceil(total / parseInt(limit)) } }, 'Events fetched'));
  } catch (error) { next(error); }
};

const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'email').populate('registrations.user', 'email');
    if (!event) throw new ApiError(404, 'Event not found');
    return res.json(new ApiResponse(200, event, 'Event fetched'));
  } catch (error) { next(error); }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, event, 'Event created'));
  } catch (error) { next(error); }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) throw new ApiError(404, 'Event not found');
    return res.json(new ApiResponse(200, event, 'Event updated'));
  } catch (error) { next(error); }
};

const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) throw new ApiError(404, 'Event not found');
    const alreadyRegistered = event.registrations.some(r => r.user.toString() === req.user._id.toString());
    if (alreadyRegistered) throw new ApiError(400, 'Already registered for this event');
    if (event.maxParticipants && event.registrations.length >= event.maxParticipants) throw new ApiError(400, 'Event is full');
    event.registrations.push({ user: req.user._id });
    await event.save();
    return res.json(new ApiResponse(200, null, 'Registered successfully'));
  } catch (error) { next(error); }
};

const deleteEvent = async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    return res.json(new ApiResponse(200, null, 'Event deleted'));
  } catch (error) { next(error); }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, registerForEvent, deleteEvent };
