const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      courseId,
      teacherId: req.user.id
    });
    await assignment.save();

    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error creating assignment' });
  }
};

const listTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.user.id })
      .populate('courseId', 'courseName courseCode')
      .sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (error) {
    console.error('List assignments error:', error);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
};

const listStudentAssignments = async (req, res) => {
  try {
    // For now, return all assignments (can be filtered by course)
    const assignments = await Assignment.find().sort({ dueDate: 1 });
    res.json({ assignments });
  } catch (error) {
    console.error('List student assignments error:', error);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, fileUrl, comments } = req.body;

    if (!assignmentId || !fileUrl) {
      return res.status(400).json({ message: 'Assignment and file are required' });
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const existing = await Submission.findOne({ assignmentId, studentId: req.user.id });
    if (existing) {
      existing.fileUrl = fileUrl;
      existing.comments = comments || existing.comments;
      existing.updatedAt = Date.now();
      await existing.save();
      return res.json({ message: 'Submission updated', submission: existing });
    }

    const submission = new Submission({
      assignmentId,
      studentId: req.user.id,
      fileUrl,
      comments
    });
    await submission.save();

    res.status(201).json({ message: 'Submission saved', submission });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error saving submission' });
  }
};

const listSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.query;

    const filter = {};
    if (assignmentId) filter.assignmentId = assignmentId;

    // If teacher, allow viewing all submissions for their assignments
    if (req.user.role === 'teacher') {
      const assignments = await Assignment.find({ teacherId: req.user.id }).select('_id');
      filter.assignmentId = { $in: assignments.map((a) => a._id) };
    }

    // If student, only their submissions
    if (req.user.role === 'student') {
      filter.studentId = req.user.id;
    }

    const submissions = await Submission.find(filter)
      .populate('assignmentId', 'title dueDate')
      .populate('studentId', 'name email');

    res.json({ submissions });
  } catch (error) {
    console.error('List submissions error:', error);
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(id).populate('assignmentId');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Ensure teacher owns the assignment
    if (submission.assignmentId.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only grade your own assignments' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    await submission.save();

    res.json({ message: 'Submission graded', submission });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error grading submission' });
  }
};

module.exports = {
  createAssignment,
  listTeacherAssignments,
  listStudentAssignments,
  submitAssignment,
  listSubmissions,
  gradeSubmission
};
