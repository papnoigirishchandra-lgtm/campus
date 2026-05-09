const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: [true, 'Submission file is required']
  },
  comments: {
    type: String,
    default: ''
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

submissionSchema.index({ assignmentId: 1, studentId: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
