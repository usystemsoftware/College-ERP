const nodemailer = require('nodemailer');

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

module.exports = {
  sendEmail,
  sendSMS,
  sendWhatsApp
};
