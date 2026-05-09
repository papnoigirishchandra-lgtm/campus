import { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from './ToastProvider';
import { getAttendanceByCourse, getGradesByCourse, getUserProfile } from '../services/firestoreService';

const TeacherCourseStudents = ({ courses = [] }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    const selected = courses.find((c) => c.id === courseId);
    if (!selected) { showToast('Select a course first', 'error'); return; }
    setLoading(true);
    try {
      const studentIds = selected.students || [];
      const profiles = await Promise.all(studentIds.map((id) => getUserProfile(id)));
      setStudents(profiles.filter(Boolean));
    } catch (error) {
      showToast('Failed to fetch students', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Students in Course</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View enrolled students for a specific course.</p>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="flex-1">
            <option value="">Select a course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.courseName} ({c.courseCode})</option>)}
          </select>
          <button onClick={fetchStudents} disabled={!courseId || loading} className="btn-primary px-6 disabled:opacity-60">
            {loading ? 'Loading...' : 'Fetch Students'}
          </button>
        </div>

        {students.length > 0 ? (
          <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">UID</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-300">
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{s.name}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{s.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Select a course and click "Fetch Students" to see enrolled students.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseStudents;
