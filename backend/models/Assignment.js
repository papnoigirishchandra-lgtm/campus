const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  }
}, { timestamps: true });

assignmentSchema.index({ teacherId: 1, courseId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
