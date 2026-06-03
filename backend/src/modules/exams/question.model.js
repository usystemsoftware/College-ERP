const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['MCQ', 'Subjective', 'TrueFalse'], default: 'MCQ' },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, required: true, default: 1 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  explanation: { type: String }
}, { timestamps: true });

questionSchema.index({ test: 1 });

module.exports = mongoose.model('Question', questionSchema);
