const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Grades = require('../models/Grades');
const Course = require('../models/Course');
const { getSocket } = require('../utils/socket');

const markAttendance = async (req, res) => {
  try {
    const { courseId, studentId, date, status } = req.body;

    // Validate required fields
    if (!courseId || !studentId || !date || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if course exists and teacher is the owner
    const course = await Course.findById(courseId);
    if (!course || course.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the course teacher' });
    }

    // Check if student exists and is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    // Create or update attendance
    const attendance = await Attendance.findOneAndUpdate(
      { studentId, courseId, date: new Date(date) },
      { status },
      { upsert: true, new: true }
    ).populate('studentId', 'name email').populate('courseId', 'courseName courseCode');

    // Emit real-time notification for the student
    const io = getSocket();
    io?.emit('attendanceUpdated', {
      teacherId: req.user.id,
      studentId: attendance.studentId._id?.toString(),
      courseId: attendance.courseId._id?.toString(),
      status: attendance.status,
      date: attendance.date
    });

    res.json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadGrades = async (req, res) => {
  try {
    const { studentId, courseId, marks, examType } = req.body;

    // Validate required fields
    if (!studentId || !courseId || marks === undefined || !examType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if course exists and teacher is the owner
    const course = await Course.findById(courseId);
    if (!course || course.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the course teacher' });
    }

    // Check if student exists and is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    // Validate marks
    if (marks < 0 || marks > 100) {
      return res.status(400).json({ message: 'Marks must be between 0 and 100' });
    }

    // Create or update grade
    const grade = await Grades.findOneAndUpdate(
      { studentId, courseId, examType },
      { marks },
      { upsert: true, new: true }
    ).populate('studentId', 'name email').populate('courseId', 'courseName courseCode');

    // Emit real-time notification for the student
    const io = getSocket();
    io?.emit('gradeUpdated', {
      teacherId: req.user.id,
      studentId: grade.studentId._id?.toString(),
      courseId: grade.courseId._id?.toString(),
      examType: grade.examType,
      marks: grade.marks
    });

    res.json({
      message: 'Grade uploaded successfully',
      grade
    });
  } catch (error) {
    console.error('Upload grades error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email _id')
      .sort({ name: 1 });

    res.json({
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Check if course exists and teacher is the owner
    const course = await Course.findById(courseId);
    if (!course || course.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the course teacher' });
    }

    // Get unique students from attendance records
    const attendances = await Attendance.find({ courseId })
      .populate('studentId', 'name email _id')
      .select('studentId');

    // Extract unique students
    const studentMap = new Map();
    attendances.forEach(attendance => {
      if (attendance.studentId) {
        studentMap.set(attendance.studentId._id.toString(), attendance.studentId);
      }
    });

    const students = Array.from(studentMap.values());

    res.json({
      course: {
        id: course._id,
        name: course.courseName,
        code: course.courseCode
      },
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { markAttendance, uploadGrades, getStudents, getCourseStudents };