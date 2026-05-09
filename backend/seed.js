const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Course = require('./models/Course');
const Assignment = require('./models/Assignment');
const Attendance = require('./models/Attendance');
const Grades = require('./models/Grades');

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // ── Clear ALL existing data ──────────────────────────────
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await Attendance.deleteMany({});
    await Grades.deleteMany({});
    console.log('Cleared all existing data');

    const commonPassword = await bcrypt.hash('password123', 10);

    // ── Admin ────────────────────────────────────────────────
    const admin = new User({
      name: 'System Admin',
      email: 'admin@campus.com',
      password: commonPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('Created 1 admin');

    // ── Teachers ─────────────────────────────────────────────
    const teachersData = [
      { name: 'Dr. Alice Smith',      email: 'alice@teacher.com' },
      { name: 'Prof. Robert Johnson', email: 'robert@teacher.com' },
      { name: 'Dr. Sarah Wilson',     email: 'sarah@teacher.com' },
      { name: 'Prof. Michael Brown',  email: 'michael@teacher.com' }
    ];

    const teachers = [];
    for (const data of teachersData) {
      const teacher = new User({ ...data, password: commonPassword, role: 'teacher' });
      await teacher.save();
      teachers.push(teacher);
    }
    console.log('Created 4 teachers');

    // ── Courses ──────────────────────────────────────────────
    const coursesData = [
      { name: 'Data Structures & Algorithms', code: 'CS201', teacherIndex: 0 },
      { name: 'Database Management Systems',  code: 'CS301', teacherIndex: 0 },
      { name: 'Software Engineering',         code: 'CS401', teacherIndex: 1 },
      { name: 'Machine Learning',             code: 'CS501', teacherIndex: 1 },
      { name: 'Quantum Physics',              code: 'PH101', teacherIndex: 2 },
      { name: 'Thermodynamics',               code: 'ME202', teacherIndex: 2 },
      { name: 'Macroeconomics',               code: 'EC101', teacherIndex: 3 },
      { name: 'Digital Electronics',          code: 'EE201', teacherIndex: 3 }
    ];

    const courses = [];
    for (const data of coursesData) {
      const course = new Course({
        courseName: data.name,
        courseCode: data.code,
        teacherId: teachers[data.teacherIndex]._id
      });
      await course.save();
      courses.push(course);
    }
    console.log('Created 8 courses');

    // ── Students ─────────────────────────────────────────────
    const departments = [
      'Computer Science', 'Mechanical Engineering',
      'Electrical Engineering', 'Physics', 'Economics'
    ];
    const studentNames = [
      'James Miller',      'Emily Davis',       'Michael Garcia',
      'Sophia Martinez',   'Daniel Rodriguez',  'Olivia Hernandez',
      'William Lopez',     'Isabella Gonzalez', 'David Wilson',
      'Mia Anderson',      'Joseph Thomas',     'Charlotte Taylor',
      'Christopher Moore', 'Amelia Jackson',    'Andrew White',
      'Abigail Harris',    'Joshua Martin',     'Harper Thompson',
      'Nathan Garcia',     'Evelyn Lewis'
    ];

    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
      const student = new User({
        name: studentNames[i],
        email: `student${i + 1}@campus.com`,
        password: commonPassword,
        role: 'student'
      });
      await student.save();
      students.push(student);

      await new StudentProfile({
        userId: student._id,
        rollNumber: `ROLL${2024000 + i}`,
        department: departments[i % departments.length],
        semester: (i % 8) + 1
      }).save();
    }
    console.log('Created 20 students with profiles');

    // ── Assignments (3 per course) ───────────────────────────
    const assignmentTemplates = [
      { suffix: 'Fundamentals',      dayOffset: 7  },
      { suffix: 'Mid-Term Project',  dayOffset: 21 },
      { suffix: 'Advanced Problems', dayOffset: 35 }
    ];

    for (const course of courses) {
      for (const tmpl of assignmentTemplates) {
        await new Assignment({
          title: `${course.courseName} – ${tmpl.suffix}`,
          description: `Complete the ${tmpl.suffix.toLowerCase()} exercises for ${course.courseName}. Submit your solution as a PDF.`,
          teacherId: course.teacherId,
          courseId: course._id,
          dueDate: new Date(Date.now() + tmpl.dayOffset * 24 * 60 * 60 * 1000)
        }).save();
      }
    }
    console.log('Created 24 assignments (3 per course)');

    // ── Attendance Records ───────────────────────────────────
    // Each student attends 4 courses; record the last 30 weekdays
    const attendanceStatuses = [
      'present', 'present', 'present', 'present', 'present', 'absent', 'late'
    ];

    let attendanceCount = 0;
    for (const student of students) {
      const studentCourses = [...courses].sort(() => 0.5 - Math.random()).slice(0, 4);

      for (const course of studentCourses) {
        for (let day = 1; day <= 30; day++) {
          const date = new Date();
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() - day);

          // Skip weekends
          if (date.getDay() === 0 || date.getDay() === 6) continue;

          try {
            await new Attendance({
              studentId: student._id,
              courseId: course._id,
              date,
              status: randomChoice(attendanceStatuses)
            }).save();
            attendanceCount++;
          } catch (_) { /* ignore duplicate key errors */ }
        }
      }
    }
    console.log(`Created ~${attendanceCount} attendance records`);

    // ── Grades (5 exam types per course per student) ─────────
    const examTypes = ['quiz', 'midterm', 'final', 'assignment', 'project'];
    const markRanges = {
      quiz:       { min: 55, max: 100 },
      midterm:    { min: 45, max: 95  },
      final:      { min: 40, max: 98  },
      assignment: { min: 60, max: 100 },
      project:    { min: 50, max: 100 }
    };

    let gradeCount = 0;
    for (const student of students) {
      const studentCourses = [...courses].sort(() => 0.5 - Math.random()).slice(0, 4);

      for (const course of studentCourses) {
        for (const examType of examTypes) {
          const { min, max } = markRanges[examType];
          try {
            await new Grades({
              studentId: student._id,
              courseId: course._id,
              marks: randomInRange(min, max),
              examType
            }).save();
            gradeCount++;
          } catch (_) { /* ignore duplicate key errors */ }
        }
      }
    }
    console.log(`Created ~${gradeCount} grade records`);

    // ── Summary ──────────────────────────────────────────────
    console.log('\n══════════════════════════════════');
    console.log('         SEEDING COMPLETE         ');
    console.log('══════════════════════════════════');
    console.log('Password (all accounts): password123\n');
    console.log('  Admin  :  admin@campus.com');
    console.log('  Teacher:  alice@teacher.com');
    console.log('  Student:  student1@campus.com');
    console.log('══════════════════════════════════\n');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedUsers();