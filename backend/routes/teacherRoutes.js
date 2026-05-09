const express = require('express');
const { markAttendance, uploadGrades, getStudents, getCourseStudents } = require('../controllers/teacherController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication and teacher role
router.use(auth, roleCheck('teacher'));

router.post('/attendance/mark', markAttendance);
router.post('/grades/upload', uploadGrades);
router.get('/students', getStudents);
router.get('/course-students', getCourseStudents);

module.exports = router;