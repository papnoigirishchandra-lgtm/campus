import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from './ToastProvider';
import { getGradesByCourse, getAttendanceByCourse } from '../services/firestoreService';

const TeacherPerformanceReport = ({ courses = [] }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [grades, attendance] = await Promise.all([
        getGradesByCourse(courseId),
        getAttendanceByCourse(courseId),
      ]);

      const selectedCourse = courses.find((c) => c.id === courseId);
      const marks = grades.map((g) => g.marks || 0);
      const avgMarks = marks.length > 0 ? (marks.reduce((s, m) => s + m, 0) / marks.length).toFixed(1) : 0;
      const presentCount = attendance.filter((a) => a.status === 'present').length;
      const attendanceRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : 0;

      setReport({
        courseName: selectedCourse?.courseName || courseId,
        courseCode: selectedCourse?.courseCode || '',
        totalGrades: grades.length,
        averageMarks: avgMarks,
        totalAttendanceRecords: attendance.length,
        attendanceRate,
        highestMark: marks.length > 0 ? Math.max(...marks) : 0,
        lowestMark: marks.length > 0 ? Math.min(...marks) : 0,
        generatedAt: new Date().toLocaleString(),
      });
    } catch (error) {
      showToast('Failed to generate report', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Performance Report</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate analytics from Firestore data for a course.</p>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="flex-1">
            <option value="">Select a course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.courseName} ({c.courseCode})</option>)}
          </select>
          <button onClick={generateReport} disabled={!courseId || loading} className="btn-primary px-6 disabled:opacity-60">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {report && (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 text-lg">{report.courseName}</h4>
              <span className="font-mono text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800/30">{report.courseCode}</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">Generated at: {report.generatedAt}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Grades', value: report.totalGrades },
                { label: 'Average Marks', value: report.averageMarks },
                { label: 'Highest Mark', value: report.highestMark },
                { label: 'Lowest Mark', value: report.lowestMark },
                { label: 'Attendance Records', value: report.totalAttendanceRecords },
                { label: 'Attendance Rate', value: `${report.attendanceRate}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPerformanceReport;
