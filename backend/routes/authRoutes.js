const express = require('express');
const {
  register,
  login,
  firebaseLogin,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.post('/login', login);
router.post('/firebase-login', firebaseLogin);

// Public register for students
router.post('/register/student', (req, res) => {
  req.body.role = 'student';
  register(req, res);
});

// Protected register for teachers/admins (admin only)
router.post('/register', auth, roleCheck('admin'), register);

// Profile endpoints
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Password reset flow
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
