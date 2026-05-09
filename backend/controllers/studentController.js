const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Grades = require('../models/Grades');
const Course = require('../models/Course');

const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all grades for GPA calculation
    const grades = await Grades.find({ studentId }).populate('courseId', 'courseName courseCode');

    // Calculate GPA (simple average of all grades)
    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
    const gpa = grades.length > 0 ? (totalMarks / grades.length).toFixed(2) : 0;

    // Get attendance records
    const attendances = await Attendance.find({ studentId });
    const totalClasses = attendances.length;
    const presentClasses = attendances.filter(att => att.status === 'present').length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    // Course performance: average marks per course
    const courseMap = new Map();
    grades.forEach(grade => {
      const courseId = grade.courseId._id.toString();
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseName: grade.courseId.courseName,
          courseCode: grade.courseId.courseCode,
          grades: []
        });
      }
      courseMap.get(courseId).grades.push(grade.marks);
    });

    const coursePerformance = Array.from(courseMap.entries()).map(([courseId, data]) => {
      const average = (data.grades.reduce((sum, mark) => sum + mark, 0) / data.grades.length).toFixed(2);
      return {
        courseId,
        courseName: data.courseName,
        courseCode: data.courseCode,
        averageMarks: parseFloat(average),
        totalExams: data.grades.length
      };
    });

    res.json({
      gpa: parseFloat(gpa),
      attendancePercentage: parseFloat(attendancePercentage),
      coursePerformance
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGrades = async (req, res) => {
  try {
    const grades = await Grades.find({ studentId: req.user.id })
      .populate('courseId', 'courseName courseCode')
      .sort({ createdAt: -1 });

    res.json({
      count: grades.length,
      grades
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.user.id })
      .populate('courseId', 'courseName courseCode')
      .sort({ date: -1 });

    res.json({
      count: attendance.length,
      attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPerformanceAnalytics = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get grades and attendance
    const [grades, attendances] = await Promise.all([
      Grades.find({ studentId }).populate('courseId', 'courseName courseCode'),
      Attendance.find({ studentId })
    ]);

    // Exam type performance
    const examStats = {};
    grades.forEach(grade => {
      if (!examStats[grade.examType]) {
        examStats[grade.examType] = { total: 0, count: 0 };
      }
      examStats[grade.examType].total += grade.marks;
      examStats[grade.examType].count += 1;
    });

    const examPerformance = Object.entries(examStats).map(([type, stats]) => ({
      examType: type,
      averageScore: parseFloat((stats.total / stats.count).toFixed(2)),
      totalExams: stats.count
    }));

    // Course-wise attendance
    const courseAttendanceMap = new Map();
    attendances.forEach(att => {
      const courseId = att.courseId.toString();
      if (!courseAttendanceMap.has(courseId)) {
        courseAttendanceMap.set(courseId, { total: 0, present: 0 });
      }
      const stats = courseAttendanceMap.get(courseId);
      stats.total += 1;
      if (att.status === 'present') stats.present += 1;
    });

    const courseAttendance = await Promise.all(
      Array.from(courseAttendanceMap.entries()).map(async ([courseId, stats]) => {
        const course = await Course.findById(courseId).select('courseName courseCode');
        return {
          courseId,
          courseName: course.courseName,
          courseCode: course.courseCode,
          attendancePercentage: parseFloat(((stats.present / stats.total) * 100).toFixed(2)),
          totalClasses: stats.total,
          attendedClasses: stats.present
        };
      })
    );

    // Overall statistics
    const totalGrades = grades.length;
    const averageGrade = totalGrades > 0 ? parseFloat((grades.reduce((sum, g) => sum + g.marks, 0) / totalGrades).toFixed(2)) : 0;
    const totalAttendanceRecords = attendances.length;
    const overallAttendance = totalAttendanceRecords > 0 ? parseFloat(((attendances.filter(a => a.status === 'present').length / totalAttendanceRecords) * 100).toFixed(2)) : 0;

    // GPA (same as average grade in our simplified model)
    const gpa = averageGrade;

    // Subject-wise (course) performance
    const subjectMap = new Map();
    grades.forEach((grade) => {
      const courseId = grade.courseId._id.toString();
      if (!subjectMap.has(courseId)) {
        subjectMap.set(courseId, {
          courseName: grade.courseId.courseName,
          courseCode: grade.courseId.courseCode,
          total: 0,
          count: 0
        });
      }
      const subject = subjectMap.get(courseId);
      subject.total += grade.marks;
      subject.count += 1;
    });

    const subjectPerformance = Array.from(subjectMap.entries()).map(([courseId, data]) => ({
      courseId,
      courseName: data.courseName,
      courseCode: data.courseCode,
      averageScore: parseFloat((data.total / data.count).toFixed(2)),
      examsTaken: data.count
    }));

    // Performance trends (average score per month)
    const trendMap = new Map();
    grades.forEach((grade) => {
      const date = new Date(grade.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!trendMap.has(monthKey)) {
        trendMap.set(monthKey, { total: 0, count: 0 });
      }
      const stats = trendMap.get(monthKey);
      stats.total += grade.marks;
      stats.count += 1;
    });

    const performanceTrends = Array.from(trendMap.entries())
      .map(([period, stats]) => ({
        period,
        averageScore: parseFloat((stats.total / stats.count).toFixed(2)),
        exams: stats.count
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    res.json({
      summary: {
        totalGrades,
        averageGrade,
        totalAttendanceRecords,
        overallAttendancePercentage: overallAttendance,
        gpa,
        attendancePercentage: overallAttendance
      },
      examPerformance,
      courseAttendance,
      subjectPerformance,
      performanceTrends
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getGrades, getAttendance, getPerformanceAnalytics };