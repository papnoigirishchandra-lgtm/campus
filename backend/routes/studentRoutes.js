const express = require('express');
const { getDashboard, getGrades, getAttendance, getPerformanceAnalytics } = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication and student role
router.use(auth, roleCheck('student'));

router.get('/dashboard', getDashboard);
router.get('/grades', getGrades);
router.get('/attendance', getAttendance);
router.get('/performance-analytics', getPerformanceAnalytics);

module.exports = router;