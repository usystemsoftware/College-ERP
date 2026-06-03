const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: { type: String, required: true }, // Format HH:MM
  endTime: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, // Optional (could be break)
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  roomId: { type: String } // Keeping it a string for simplicity, could be ref to Room
});

const timetableSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  
  slots: [slotSchema],
  
  isActive: { type: Boolean, default: true },
  published: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
