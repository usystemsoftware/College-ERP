/**
 * SMS/WhatsApp Alert Service
 * Uses Twilio REST API directly via fetch (no extra dependencies).
 * Falls back to console logging if TWILIO credentials are not configured.
 */

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

const isConfigured = () => !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_PHONE);

/**
 * Send SMS via Twilio REST API
 */
async function sendSMSViaTwilio(to, body) {
  if (!isConfigured()) {
    console.log(`[SMS Mock] To: ${to} | Message: ${body}`);
    return { success: true, mock: true };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_PHONE,
        Body: body
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[SMS] Sent to ${to}: SID ${data.sid}`);
      return { success: true, sid: data.sid };
    } else {
      console.error(`[SMS Error] ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error(`[SMS Error] ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp message via Twilio
 */
async function sendWhatsAppViaTwilio(to, body) {
  if (!isConfigured()) {
    console.log(`[WhatsApp Mock] To: ${to} | Message: ${body}`);
    return { success: true, mock: true };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: `whatsapp:${to}`,
        From: TWILIO_WHATSAPP,
        Body: body
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[WhatsApp] Sent to ${to}: SID ${data.sid}`);
      return { success: true, sid: data.sid };
    } else {
      console.error(`[WhatsApp Error] ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error(`[WhatsApp Error] ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send attendance alert to parent
 */
async function sendAttendanceAlert(parentPhone, studentName, percentage) {
  const message = `⚠️ College ERP Alert: ${studentName}'s attendance is ${percentage}%, below the 75% threshold. Please contact the college for details.`;
  
  // Try WhatsApp first, then SMS
  const waResult = await sendWhatsAppViaTwilio(parentPhone, message);
  if (!waResult.success || waResult.mock) {
    await sendSMSViaTwilio(parentPhone, message);
  }
  return { sent: true };
}

/**
 * Send exam result alert to parent
 */
async function sendResultAlert(parentPhone, studentName, examTitle, grade) {
  const message = `📝 College ERP: ${studentName}'s result for "${examTitle}" has been published. Grade: ${grade}. Check the parent portal for details.`;
  
  const waResult = await sendWhatsAppViaTwilio(parentPhone, message);
  if (!waResult.success || waResult.mock) {
    await sendSMSViaTwilio(parentPhone, message);
  }
  return { sent: true };
}

/**
 * Send critical incident alert to admin
 */
async function sendIncidentAlert(adminPhone, incidentTitle, urgency) {
  const message = `🚨 URGENT (${urgency}): New incident reported — "${incidentTitle}". Please check the admin dashboard immediately.`;
  await sendSMSViaTwilio(adminPhone, message);
  return { sent: true };
}

module.exports = {
  sendSMSViaTwilio,
  sendWhatsAppViaTwilio,
  sendAttendanceAlert,
  sendResultAlert,
  sendIncidentAlert,
  isConfigured
};
