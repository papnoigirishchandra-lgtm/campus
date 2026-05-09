const express = require('express');
const {
  createAssignment,
  listTeacherAssignments,
  listStudentAssignments,
  submitAssignment,
  listSubmissions,
  gradeSubmission
} = require('../controllers/assignmentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Teacher routes
router.post('/', auth, roleCheck('teacher'), createAssignment);
router.get('/teacher', auth, roleCheck('teacher'), listTeacherAssignments);
router.get('/submissions', auth, roleCheck('teacher', 'student'), listSubmissions);
router.put('/submissions/:id/grade', auth, roleCheck('teacher'), gradeSubmission);

// Student routes
router.get('/student', auth, roleCheck('student'), listStudentAssignments);
router.post('/submit', auth, roleCheck('student'), submitAssignment);

module.exports = router;
