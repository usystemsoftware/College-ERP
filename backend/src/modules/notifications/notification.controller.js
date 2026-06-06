const Notification = require('./notification.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getMyNotifications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { $or: [{ recipient: req.user._id }, { recipient: null }] };
    
    // Support filtering by isRead as well
    if (status) {
      if (status === 'Unread') filter.$or.forEach(f => { f.isRead = false; f.status = 'Unread'; });
      else if (status === 'Read') filter.$or.forEach(f => { f.isRead = true; f.status = 'Read'; });
      else filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ 
        $or: [
          { recipient: req.user._id, status: 'Unread' },
          { recipient: req.user._id, isRead: false },
          { recipient: null, status: 'Unread' },
          { recipient: null, isRead: false }
        ]
      })
    ]);
    return res.json(new ApiResponse(200, { notifications, unreadCount: unread, pagination: { total, pages: Math.ceil(total / parseInt(limit)) } }, 'Notifications fetched'));
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id },
      { status: 'Read', isRead: true, readAt: new Date() }
    );
    return res.json(new ApiResponse(200, null, 'Marked as read'));
  } catch (error) { next(error); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { $or: [{ recipient: req.user._id }, { recipient: null }], status: 'Unread' },
      { status: 'Read', isRead: true, readAt: new Date() }
    );
    return res.json(new ApiResponse(200, null, 'All notifications marked as read'));
  } catch (error) { next(error); }
};

const sendNotification = async (req, res, next) => {
  try {
    const { recipients, title, message, type, category } = req.body;
    if (!recipients?.length || !title || !message) throw new ApiError(400, 'Recipients, title and message required');
    const notifications = recipients.map(r => ({
      recipient: r, sender: req.user._id, title, message, type: type || 'System',
      category: category || 'General', collegeId: req.user.collegeId
    }));
    await Notification.insertMany(notifications);
    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      recipients.forEach(r => io.to(r.toString()).emit('notification', { title, message }));
    }
    return res.status(201).json(new ApiResponse(201, null, `${notifications.length} notifications sent`));
  } catch (error) { next(error); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    return res.json(new ApiResponse(200, null, 'Notification deleted'));
  } catch (error) { next(error); }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, sendNotification, deleteNotification };
