const nodemailer = require('nodemailer');
const Notification = require('../modules/notifications/notification.model');

let ioInstance = null;

const setIo = (io) => {
  ioInstance = io;
};

// Preconfigured mock transporter or standard transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@college-erp.com',
      to,
      subject,
      html
    });
    console.log(`[Notification Engine] Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Notification Engine] Email error: ${error.message}`);
    return false;
  }
};

const sendSMS = async (to, message) => {
  // Mock SMS implementation
  console.log(`[Notification Engine] SMS sent to ${to}: ${message}`);
  return true;
};

const sendWhatsApp = async (to, message) => {
  // Mock WhatsApp implementation
  console.log(`[Notification Engine] WhatsApp sent to ${to}: ${message}`);
  return true;
};

const emitNotification = async ({ title, message, type, category = 'General', recipient = null, metadata = null }) => {
  try {
    console.log('[emitNotification] Called with:', { title, message, type, category, recipient, metadata });
    console.log('[emitNotification] ioInstance set?', !!ioInstance);

    const notification = await Notification.create({
      title,
      message,
      type,
      category,
      recipient, // Can be null for broadcast
      metadata,
      isRead: false,
      status: 'Unread'
    });

    console.log('[emitNotification] Notification saved to DB:', notification._id);

    if (ioInstance) {
      if (recipient) {
        // Emit to specific user if they joined a room with their user ID
        ioInstance.to(recipient.toString()).emit('new_notification', notification);
        console.log('[emitNotification] Emitted to room:', recipient.toString());
      } else {
        // Broadcast to all connected clients
        ioInstance.emit('new_notification', notification);
        console.log('[emitNotification] Broadcast to all clients');
      }
    } else {
      console.warn('[emitNotification] ⚠️  ioInstance is NULL — socket not initialized yet!');
    }
  } catch (error) {
    console.error('[emitNotification] ❌ Failed to emit notification:', error.message, error);
  }
};

module.exports = {
  setIo,
  sendEmail,
  sendSMS,
  sendWhatsApp,
  emitNotification
};
