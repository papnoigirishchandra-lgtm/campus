const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grades = require('../models/Grades');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const { getSocket } = require('../utils/socket');

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
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

    // Emit real-time update
    const io = getSocket();
    io?.emit('userCreated', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate role if provided
    if (updates.role && !['student', 'teacher', 'admin'].includes(updates.role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Hash password if provided
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Emit real-time update
    const io = getSocket();
    io?.emit('userUpdated', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related data
    await Attendance.deleteMany({ studentId: id });
    await Grades.deleteMany({ studentId: id });

    // If teacher, update courses
    if (user.role === 'teacher') {
      await Course.updateMany({ teacherId: id }, { teacherId: null });
    }

    // Emit real-time update
    const io = getSocket();
    io?.emit('userDeleted', { id });

    res.json({ message: 'User and related data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { courseName, courseCode, teacherId } = req.body;

    // Validate required fields
    if (!courseName || !courseCode || !teacherId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if teacher exists and has teacher role
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this code already exists' });
    }

    // Create course
    const course = new Course({
      courseName,
      courseCode: courseCode.toUpperCase(),
      teacherId
    });

    await course.save();

    // Emit real-time update
    const io = getSocket();
    io?.emit('courseCreated', {
      id: course._id,
      courseName: course.courseName,
      courseCode: course.courseCode,
      teacherId: course.teacherId
    });

    res.status(201).json({
      message: 'Course created successfully',
      course: {
        id: course._id,
        courseName: course.courseName,
        courseCode: course.courseCode,
        teacherId: course.teacherId
      }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate teacher if provided
    if (updates.teacherId) {
      const teacher = await User.findById(updates.teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Invalid teacher ID' });
      }
    }

    // Convert courseCode to uppercase if provided
    if (updates.courseCode) {
      updates.courseCode = updates.courseCode.toUpperCase();
    }

    const course = await Course.findByIdAndUpdate(id, updates, { new: true });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Emit real-time update
    const io = getSocket();
    io?.emit('courseUpdated', {
      id: course._id,
      courseName: course.courseName,
      courseCode: course.courseCode,
      teacherId: course.teacherId
    });

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete related attendance and grades
    await Attendance.deleteMany({ courseId: id });
    await Grades.deleteMany({ courseId: id });

    // Emit real-time update
    const io = getSocket();
    io?.emit('courseDeleted', { id });

    res.json({ message: 'Course and related data deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportUsersCsv = async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt');
    const header = ['Name', 'Email', 'Role', 'Created At'];
    const rows = users.map((u) => [u.name, u.email, u.role, u.createdAt.toISOString()]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export users CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportReportsPdf = async (req, res) => {
  try {
    const reportsData = await getReportsData();

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reports.pdf"');

    doc.pipe(res);

    doc.font('Helvetica-Bold').fontSize(20).text('Campus Companion Reports', { align: 'center' });
    doc.moveDown();

    doc.font('Helvetica-Bold').fontSize(14).text('User Statistics');
    Object.entries(reportsData.userStatistics).forEach(([role, count]) => {
      doc.font('Helvetica').fontSize(12).text(`${role}: ${count}`);
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(14).text('Course Statistics');
    doc.font('Helvetica').fontSize(12).text(`Total courses: ${reportsData.courseStatistics.totalCourses}`);

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(14).text('Attendance Statistics');
    Object.entries(reportsData.attendanceStatistics).forEach(([status, count]) => {
      doc.font('Helvetica').fontSize(12).text(`${status}: ${count}`);
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(14).text('Grade Statistics');
    const gs = reportsData.gradeStatistics;
    doc.font('Helvetica').fontSize(12).text(`Average: ${gs.averageMarks.toFixed(2)}`);
    doc.text(`Highest: ${gs.highestMark}, Lowest: ${gs.lowestMark}`);

    doc.end();
  } catch (error) {
    console.error('Export reports PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReportsData = async () => {
  const userStats = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const totalCourses = await Course.countDocuments();
  const attendanceStats = await Attendance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const gradeStats = await Grades.aggregate([
    {
      $group: {
        _id: null,
        averageMarks: { $avg: '$marks' },
        totalGrades: { $sum: 1 },
        highestMark: { $max: '$marks' },
        lowestMark: { $min: '$marks' }
      }
    }
  ]);

  return {
    userStatistics: userStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    courseStatistics: { totalCourses },
    attendanceStatistics: attendanceStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    gradeStatistics: gradeStats[0] || { averageMarks: 0, totalGrades: 0, highestMark: 0, lowestMark: 0 }
  };
};

const getReports = async (req, res) => {
  try {
    // Get user statistics by role
    const userStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get course statistics
    const totalCourses = await Course.countDocuments();

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get grade statistics
    const gradeStats = await Grades.aggregate([
      {
        $group: {
          _id: null,
          averageMarks: { $avg: '$marks' },
          totalGrades: { $sum: 1 },
          highestMark: { $max: '$marks' },
          lowestMark: { $min: '$marks' }
        }
      }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentCourses = await Course.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentAttendance = await Attendance.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentGrades = await Grades.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const reports = {
      userStatistics: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      courseStatistics: {
        totalCourses
      },
      attendanceStatistics: attendanceStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      gradeStatistics: gradeStats[0] || {
        averageMarks: 0,
        totalGrades: 0,
        highestMark: 0,
        lowestMark: 0
      },
      recentActivity: {
        users: recentUsers,
        courses: recentCourses,
        attendance: recentAttendance,
        grades: recentGrades
      }
    };

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};