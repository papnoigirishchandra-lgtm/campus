const mongoose = require('mongoose');

const gradesSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  examType: {
    type: String,
    enum: {
      values: ['quiz', 'midterm', 'final', 'assignment', 'project'],
      message: 'Exam type must be quiz, midterm, final, assignment, or project'
    },
    required: [true, 'Exam type is required']
  }
}, { timestamps: true });

// Compound index for unique grades per student per course per exam type
gradesSchema.index({ studentId: 1, courseId: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model('Grades', gradesSchema);