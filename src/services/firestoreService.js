/**
 * firestoreService.js
 * Central service for all Firestore database operations.
 * Replaces the old Express/MongoDB backend API calls.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

// ─── COLLECTIONS ────────────────────────────────────────────────────────────
const USERS        = 'users';
const COURSES      = 'courses';
const GRADES       = 'grades';
const ATTENDANCE   = 'attendance';
const ASSIGNMENTS  = 'assignments';
const SUBMISSIONS  = 'submissions';
const ANNOUNCEMENTS = 'announcements';
const ACTIVITY     = 'activityFeed';

// ─── ACTIVITY LOG HELPER ─────────────────────────────────────────────────────
export const logActivity = async (type, message, userId = null) => {
  try {
    await addDoc(collection(db, ACTIVITY), {
      type,
      message,
      userId,
      createdAt: serverTimestamp(),
    });
  } catch (_) {}
};

// ─── USER PROFILE ────────────────────────────────────────────────────────────
export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, USERS, uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, USERS, uid), { ...data, updatedAt: serverTimestamp() });
};

// Upload avatar to Firebase Storage and return download URL
export const uploadAvatar = async (uid, dataUrl) => {
  const storageRef = ref(storage, `avatars/${uid}`);
  await uploadString(storageRef, dataUrl, 'data_url');
  return await getDownloadURL(storageRef);
};

// ─── ADMIN: USER MANAGEMENT ───────────────────────────────────────────────────
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, USERS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getUsersByRole = async (role) => {
  const q = query(collection(db, USERS), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateUser = async (uid, data) => {
  await updateDoc(doc(db, USERS, uid), { ...data, updatedAt: serverTimestamp() });
  await logActivity('userUpdated', `User ${data.name || uid} was updated`);
};

export const deleteUser = async (uid) => {
  await deleteDoc(doc(db, USERS, uid));
  await logActivity('userDeleted', `User ${uid} was deleted`);
};

// ─── COURSES ─────────────────────────────────────────────────────────────────
export const createCourse = async (data) => {
  const ref2 = await addDoc(collection(db, COURSES), {
    ...data,
    students: [],
    createdAt: serverTimestamp(),
  });
  await logActivity('courseCreated', `Course "${data.courseName}" was created`);
  return ref2.id;
};

export const getAllCourses = async () => {
  const snap = await getDocs(collection(db, COURSES));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getCoursesByTeacher = async (teacherId) => {
  const q = query(collection(db, COURSES), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getCoursesByStudent = async (studentId) => {
  const q = query(collection(db, COURSES), where('students', 'array-contains', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateCourse = async (courseId, data) => {
  await updateDoc(doc(db, COURSES, courseId), { ...data, updatedAt: serverTimestamp() });
  await logActivity('courseUpdated', `Course "${data.courseName || courseId}" was updated`);
};

export const deleteCourse = async (courseId) => {
  await deleteDoc(doc(db, COURSES, courseId));
  await logActivity('courseDeleted', `Course ${courseId} was deleted`);
};

// ─── GRADES ──────────────────────────────────────────────────────────────────
export const addGrade = async (data) => {
  const ref2 = await addDoc(collection(db, GRADES), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await logActivity('gradeAdded', `Grade added for student ${data.studentId}`);
  return ref2.id;
};

export const getGradesByStudent = async (studentId) => {
  const q = query(collection(db, GRADES), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getGradesByCourse = async (courseId) => {
  const q = query(collection(db, GRADES), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllGrades = async () => {
  const snap = await getDocs(collection(db, GRADES));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateGrade = async (gradeId, data) => {
  await updateDoc(doc(db, GRADES, gradeId), { ...data, updatedAt: serverTimestamp() });
  await logActivity('gradeUpdated', `Grade ${gradeId} was updated`);
};

export const deleteGrade = async (gradeId) => {
  await deleteDoc(doc(db, GRADES, gradeId));
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const markAttendance = async (data) => {
  // Check if record already exists for this student+course+date
  const q = query(
    collection(db, ATTENDANCE),
    where('studentId', '==', data.studentId),
    where('courseId', '==', data.courseId),
    where('date', '==', data.date)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existing = snap.docs[0];
    await updateDoc(doc(db, ATTENDANCE, existing.id), { status: data.status, updatedAt: serverTimestamp() });
    return existing.id;
  }

  const ref2 = await addDoc(collection(db, ATTENDANCE), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await logActivity('attendanceMarked', `Attendance marked for student ${data.studentId}`);
  return ref2.id;
};

export const getAttendanceByStudent = async (studentId) => {
  const q = query(collection(db, ATTENDANCE), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAttendanceByCourse = async (courseId) => {
  const q = query(collection(db, ATTENDANCE), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllAttendance = async () => {
  const snap = await getDocs(collection(db, ATTENDANCE));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────
export const createAssignment = async (data) => {
  const ref2 = await addDoc(collection(db, ASSIGNMENTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await logActivity('assignmentCreated', `Assignment "${data.title}" was created`);
  return ref2.id;
};

export const getAssignmentsByCourse = async (courseId) => {
  const q = query(collection(db, ASSIGNMENTS), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getAssignmentsByTeacher = async (teacherId) => {
  const q = query(collection(db, ASSIGNMENTS), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getAllAssignments = async () => {
  const q = query(collection(db, ASSIGNMENTS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateAssignment = async (id, data) => {
  await updateDoc(doc(db, ASSIGNMENTS, id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteAssignment = async (id) => {
  await deleteDoc(doc(db, ASSIGNMENTS, id));
  await logActivity('assignmentDeleted', `Assignment ${id} was deleted`);
};

// ─── SUBMISSIONS ──────────────────────────────────────────────────────────────
export const submitAssignment = async (data) => {
  const ref2 = await addDoc(collection(db, SUBMISSIONS), {
    ...data,
    submittedAt: serverTimestamp(),
  });
  return ref2.id;
};

export const getSubmissionsByAssignment = async (assignmentId) => {
  const q = query(collection(db, SUBMISSIONS), where('assignmentId', '==', assignmentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getSubmissionsByStudent = async (studentId) => {
  const q = query(collection(db, SUBMISSIONS), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
export const createAnnouncement = async (data) => {
  const ref2 = await addDoc(collection(db, ANNOUNCEMENTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref2.id;
};

export const getAnnouncementsByCourse = async (courseId) => {
  const q = query(collection(db, ANNOUNCEMENTS), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getAllAnnouncements = async () => {
  const q = query(collection(db, ANNOUNCEMENTS), orderBy('createdAt', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────
export const getRecentActivity = async (limitCount = 20) => {
  const q = query(collection(db, ACTIVITY), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToActivity = (callback, limitCount = 20) => {
  const q = query(collection(db, ACTIVITY), orderBy('createdAt', 'desc'), limit(limitCount));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

// ─── ANALYTICS HELPERS ────────────────────────────────────────────────────────
export const getStudentAnalytics = async (studentId) => {
  const [grades, attendance, courses] = await Promise.all([
    getGradesByStudent(studentId),
    getAttendanceByStudent(studentId),
    getCoursesByStudent(studentId),
  ]);

  const totalGrades = grades.length;
  const avgGrade = totalGrades > 0 ? grades.reduce((s, g) => s + (g.marks || 0), 0) / totalGrades : 0;

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const totalAttendance = attendance.length;
  const overallAttendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Per-course attendance breakdown
  const courseAttendanceMap = {};
  attendance.forEach((a) => {
    if (!courseAttendanceMap[a.courseId]) {
      courseAttendanceMap[a.courseId] = { present: 0, total: 0, courseName: a.courseName || a.courseId };
    }
    courseAttendanceMap[a.courseId].total++;
    if (a.status === 'present') courseAttendanceMap[a.courseId].present++;
  });
  const courseAttendance = Object.values(courseAttendanceMap).map((c) => ({
    name: c.courseName,
    percentage: c.total > 0 ? Math.round((c.present / c.total) * 100) : 0,
  }));

  // Per-course grade breakdown
  const courseGradeMap = {};
  grades.forEach((g) => {
    if (!courseGradeMap[g.courseId]) {
      courseGradeMap[g.courseId] = { marks: [], name: g.courseName || g.courseId };
    }
    courseGradeMap[g.courseId].marks.push(g.marks || 0);
  });
  const subjectPerformance = Object.values(courseGradeMap).map((c) => ({
    name: c.name,
    average: c.marks.length > 0 ? Math.round(c.marks.reduce((s, m) => s + m, 0) / c.marks.length) : 0,
  }));

  // Performance trend (last 6 grades chronologically)
  const sortedGrades = [...grades].sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return aTime - bTime;
  });
  const performanceTrends = sortedGrades.slice(-6).map((g, i) => ({
    week: `Entry ${i + 1}`,
    marks: g.marks || 0,
  }));

  return {
    summary: {
      totalGrades,
      averageGrade: Math.round(avgGrade),
      overallAttendancePercentage,
    },
    courseAttendance,
    subjectPerformance,
    performanceTrends,
  };
};

export const getAdminReports = async () => {
  const [users, courses, grades, attendance] = await Promise.all([
    getAllUsers(),
    getAllCourses(),
    getAllGrades(),
    getAllAttendance(),
  ]);

  const userStats = { student: 0, teacher: 0, admin: 0 };
  users.forEach((u) => { if (userStats[u.role] !== undefined) userStats[u.role]++; });

  const marks = grades.map((g) => g.marks || 0);
  const avgMarks = marks.length > 0 ? marks.reduce((s, m) => s + m, 0) / marks.length : 0;

  const attStats = { present: 0, absent: 0, late: 0 };
  attendance.forEach((a) => { if (attStats[a.status] !== undefined) attStats[a.status]++; });

  return {
    userStatistics: userStats,
    courseStatistics: { totalCourses: courses.length },
    gradeStatistics: {
      totalGrades: grades.length,
      averageMarks: avgMarks,
      highestMark: marks.length > 0 ? Math.max(...marks) : 0,
      lowestMark: marks.length > 0 ? Math.min(...marks) : 0,
    },
    attendanceStatistics: attStats,
  };
};
