const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const Student = require('../students/student.model');

const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const user = req.user; // populated by auth middleware

    if (!message) {
      throw new ApiError(400, 'Message is required');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock response for development if API key is missing
      return res.status(200).json(
        new ApiResponse(200, { 
          response: `(Mock Mode) Hello ${user.email}, this is a mock response because GEMINI_API_KEY is not set in the .env file. You asked: "${message}"`
        }, 'Success')
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Gather context for the AI (Training it in human language)
    let context = `You are "SIT-Bot", the friendly, super-smart AI Campus Assistant for the State Institute of Technology (College ERP).
    
Your Personality:
- You speak naturally, like a helpful human counselor or friendly senior student.
- You use emojis occasionally to keep the mood light and encouraging!
- You are concise but polite.
- If a student asks a question you don't know the answer to (or if they ask about something completely unrelated to college), gently redirect them back to college topics or tell them to check with the admin office.

Current User Info:
- Email: ${user.email}
- Role: ${user.role?.name || user.role || 'Unknown'}`;

    // If the user is a student, we can try to fetch their student record to give more context
    const roleName = user.role?.name || user.role;
    if (roleName === 'Student') {
      try {
        const student = await Student.findOne({ user: user._id })
          .populate('department', 'name')
          .populate('course', 'name')
          .populate('semester', 'name')
          .lean();

        if (student) {
          context += `\nStudent Name: ${student.firstName} ${student.lastName}`;
          context += `\nRoll Number: ${student.rollNumber}`;
          context += `\nDepartment: ${student.department?.name || 'Unknown'}`;
          context += `\nCourse: ${student.course?.name || 'Unknown'}`;
          context += `\nSemester: ${student.semester?.name || 'Unknown'}`;
          context += `\nDivision: ${student.division || 'Unknown'}`;

          // Fetch today's timetable
          const Timetable = require('../timetables/timetable.model');
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = days[new Date().getDay()];

          const todaysClasses = await Timetable.find({
            semester: student.semester?._id,
            department: student.department?._id,
            division: student.division,
            dayOfWeek: today,
            isActive: true
          })
          .populate('subject', 'name')
          .populate('faculty', 'firstName lastName')
          .sort('startTime')
          .lean();

          if (todaysClasses.length > 0) {
            context += `\n\nToday's Timetable (${today}):`;
            todaysClasses.forEach(c => {
              context += `\n- ${c.startTime} to ${c.endTime}: ${c.subject?.name} with Prof. ${c.faculty?.firstName} ${c.faculty?.lastName} in Room ${c.roomNumber}`;
            });
          } else {
            context += `\n\nToday's Timetable (${today}): No classes scheduled today.`;
          }

          // ---- ENHANCED CONTEXT INJECTION ----
          try {
            const Fee = require('../fees/fee.model');
            const Ticket = require('../helpdesk/ticket.model');
            const Order = require('../canteen/order.model');

            const [pendingFees, activeTickets, activeOrders] = await Promise.all([
              Fee.find({ student: student._id, status: { $ne: 'Paid' } }).lean(),
              Ticket.find({ createdBy: user._id, status: { $in: ['Open', 'In Progress'] } }).lean(),
              Order.find({ user: user._id, status: { $in: ['Pending', 'Preparing', 'Ready'] } }).populate('items.menuItem', 'name').lean()
            ]);

            if (pendingFees.length > 0) {
              context += `\n\nPending Fees:`;
              pendingFees.forEach(fee => {
                const due = fee.totalAmount - (fee.paidAmount || 0);
                context += `\n- ${fee.feeType || 'Fee'}: ₹${due} due on ${new Date(fee.dueDate).toLocaleDateString()}`;
              });
            } else {
              context += `\n\nPending Fees: None!`;
            }

            if (activeTickets.length > 0) {
              context += `\n\nActive Helpdesk Tickets:`;
              activeTickets.forEach(t => {
                context += `\n- [${t.category}] "${t.title}" (Status: ${t.status})`;
              });
            }

            if (activeOrders.length > 0) {
              context += `\n\nActive Cafeteria Orders:`;
              activeOrders.forEach(o => {
                const itemNames = o.items.map(i => i.menuItem?.name).join(', ');
                context += `\n- Order #${o._id.toString().slice(-6).toUpperCase()} [Status: ${o.status}]: ${itemNames} (Total: ₹${o.totalAmount})`;
              });
            }
          } catch (contextErr) {
            console.warn('Failed to fetch enhanced context:', contextErr);
          }
          // ---- END ENHANCED CONTEXT ----

        }
      } catch (err) {
        console.warn('Could not fetch student context for AI', err);
      }
    }

    let contents = [];
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        if (!msg.text) return;
        contents.push({
          role: msg.sender === 'bot' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });
    }
    
    // Gemini requires the history to start with a 'user' role
    while (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: context
      }
    });

    return res.status(200).json(
      new ApiResponse(200, { response: response.text }, 'Success')
    );
  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Check if it's an API error from Gemini
    if (error.message && error.message.includes('401')) {
      return next(new ApiError(401, 'Invalid Gemini API Key. Please check your .env file.'));
    }
    if (error.message && error.message.includes('503')) {
      return next(new ApiError(503, 'The AI model is currently experiencing high demand. Please try again later.'));
    }

    next(new ApiError(500, 'Failed to process AI request.'));
  }
};

module.exports = {
  chat
};
