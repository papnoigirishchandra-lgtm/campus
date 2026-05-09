import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToast } from './ToastProvider';
import { API_BASE_URL } from '../utils/config';

const TeacherPerformanceReport = () => {
  const { token } = useContext(AuthContext);
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!courseId) return;
    setLoading(true);

    try {
      const studentsRes = await axios.get(`${API_BASE_URL}/api/teacher/course-students?courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const students = studentsRes.data.students || [];
      const reportData = {
        courseId,
        totalStudents: students.length,
        generatedAt: new Date().toISOString(),
        students: students.slice(0, 25)
      };

      setReport(reportData);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md p-6 shadow-lg border border-white/30">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Report</h3>
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Course ID</label>
          <input
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Course ObjectId"
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <button
          onClick={generateReport}
          disabled={!courseId || loading}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Generating…' : 'Generate Report'}
        </button>
      </div>

      {report && (
        <div className="mt-6 rounded-xl bg-indigo-50 p-4">
          <h4 className="font-semibold text-indigo-700">Report Summary</h4>
          <p className="text-sm text-indigo-700">Course ID: {report.courseId}</p>
          <p className="text-sm text-indigo-700">Total Students: {report.totalStudents}</p>
          <p className="text-sm text-indigo-700">Generated At: {new Date(report.generatedAt).toLocaleString()}</p>

          <div className="mt-4 max-h-72 overflow-auto rounded-lg bg-white p-3 shadow-inner">
            <h5 className="text-sm font-semibold text-gray-700">Sample Students</h5>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              {report.students.map((student) => (
                <li key={student._id} className="rounded-md bg-gray-50 p-2">
                  <p className="font-semibold">{student.name}</p>
                  <p>{student.email}</p>
                  <p className="text-xs text-gray-500">ID: {student._id}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPerformanceReport;
