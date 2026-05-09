const express = require('express');
const {
  createUser,
  updateUser,
  deleteUser,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllUsers,
  getAllCourses,
  exportUsersCsv,
  exportReportsPdf,
  getReports
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication and admin role
router.use(auth, roleCheck('admin'));

// User CRUD
router.post('/create-user', createUser);
router.put('/update-user/:id', updateUser);
router.delete('/delete-user/:id', deleteUser);

// Course CRUD
router.post('/create-course', createCourse);
router.put('/update-course/:id', updateCourse);
router.delete('/delete-course/:id', deleteCourse);

// Other admin endpoints
router.get('/all-users', getAllUsers);
router.get('/all-courses', getAllCourses);
router.get('/export/users', exportUsersCsv);
router.get('/export/reports', exportReportsPdf);
router.get('/reports', getReports);

module.exports = router;