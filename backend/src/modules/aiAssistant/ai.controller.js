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

    // Gather context for the AI
    let context = `You are a helpful and friendly Campus Assistant for College-ERP. 
    You are talking to a user with email: ${user.email} and role: ${user.role.name || 'Unknown'}.
    Answer their questions concisely and professionally.`;

    // If the user is a student, we can try to fetch their student record to give more context
    if (user.role && user.role.name === 'Student') {
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
        }
      } catch (err) {
        console.warn('Could not fetch student context for AI', err);
      }
    }

    // Combine history into a format Gemini expects if using generateContent directly,
    // or just pass the latest prompt with context. For simplicity, we prepend context to the current prompt.
    const fullPrompt = `System Context:\n${context}\n\nUser Message:\n${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return res.status(200).json(
      new ApiResponse(200, { response: response.text }, 'Success')
    );
  } catch (error) {
    console.error('AI Chat Error:', error);
    next(new ApiError(500, 'Failed to process AI request.'));
  }
};

module.exports = {
  chat
};
