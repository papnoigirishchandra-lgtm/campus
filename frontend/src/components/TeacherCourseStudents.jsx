import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToast } from './ToastProvider';
import { API_BASE_URL } from '../utils/config';

const TeacherCourseStudents = () => {
  const { token } = useContext(AuthContext);
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/teacher/course-students?courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data.students || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md p-6 shadow-lg border border-white/30">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Students in Course</h3>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
          <input
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Course ObjectId"
            className="flex-1 rounded-xl border border-gray-200 p-3 focus:border-indigo-400 focus:outline-none"
          />
          <button
            onClick={fetchStudents}
            disabled={!courseId || loading}
            className="mt-2 md:mt-0 rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Fetch Students'}
          </button>
        </div>

        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-gray-500">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">ID</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {students.map((student, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="px-4 py-3">{student.name}</td>
                    <td className="px-4 py-3">{student.email}</td>
                    <td className="px-4 py-3">{student._id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Enter a course ID and click fetch to view enrolled students.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseStudents;
