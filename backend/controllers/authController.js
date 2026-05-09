const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const { generateToken } = require('../utils/jwt');

const getFirebaseCredential = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  }

  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'campus-c7907',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });
  }

  return admin.credential.applicationDefault();
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getFirebaseCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'campus-c7907'
  });
}

const issueAppToken = (user) => generateToken({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatarUrl
});

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // For non-student roles, check if authenticated user is admin
    if (role !== 'student' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Only admins can register teachers or admins' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // Return success without sensitive data
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const { name, avatarUrl } = req.body;

    if (name) updates.name = name;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password -resetPasswordToken -resetPasswordExpires');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Normally you'd email this token link to the user. For now, return it so it can be tested.
    res.json({ message: 'Password reset token generated', resetToken: token });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Server error generating reset token' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and newPassword are required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = issueAppToken(user);

    // Return token and user info
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Firebase account must include an email address' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const fallbackPassword = crypto.randomBytes(32).toString('hex');
      user = new User({
        name: decodedToken.name || email.split('@')[0],
        email,
        password: await bcrypt.hash(fallbackPassword, 10),
        role: 'student',
        avatarUrl: decodedToken.picture || ''
      });

      await user.save();
    } else if (!user.avatarUrl && decodedToken.picture) {
      user.avatarUrl = decodedToken.picture;
      await user.save();
    }

    const token = issueAppToken(user);

    res.json({
      message: 'Firebase login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(401).json({ message: 'Firebase authentication failed' });
  }
};

module.exports = { register, login, firebaseLogin, getProfile, updateProfile, requestPasswordReset, resetPassword };
