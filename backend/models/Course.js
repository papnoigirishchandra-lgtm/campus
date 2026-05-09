const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    minlength: [2, 'Course name must be at least 2 characters long']
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{2,4}\d{3,4}$/.test(v); // e.g., CS101, MATH201
      },
      message: 'Course code must be in format like CS101'
    }
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  }
}, { timestamps: true });

// Index for faster queries
courseSchema.index({ courseCode: 1 });
courseSchema.index({ teacherId: 1 });

module.exports = mongoose.model('Course', courseSchema);