import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToast } from './ToastProvider';
import { API_BASE_URL } from '../utils/config';

const statuses = ['present', 'absent', 'late'];

const TeacherAttendanceMarker = () => {
  const { token } = useContext(AuthContext);
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState(statuses[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/teacher/attendance/mark`,
        { courseId, studentId, date, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Attendance marked successfully', 'success');
      setDate('');
      setStudentId('');
      setCourseId('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to mark attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Track Attendance</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Mark daily attendance for enrolled students.</p>
      </div>

      <form className="p-6 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label>Course Identifier</label>
            <input
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Enter Course ID"
              required
            />
          </div>
          <div className="space-y-2">
            <label>Student Identifier</label>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
              required
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label>Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label>Entry Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="capitalize"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                Recording Attendance...
              </>
            ) : (
              'Save Attendance Entry'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherAttendanceMarker;
