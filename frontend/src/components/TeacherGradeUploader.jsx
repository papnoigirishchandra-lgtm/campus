import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToast } from './ToastProvider';
import { API_BASE_URL } from '../utils/config';

const examTypes = ['quiz', 'midterm', 'final', 'assignment', 'project'];

const TeacherGradeUploader = () => {
  const { token } = useContext(AuthContext);
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [marks, setMarks] = useState('');
  const [examType, setExamType] = useState(examTypes[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/api/teacher/grades/upload`,
        { courseId, studentId, marks: Number(marks), examType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Grade uploaded successfully', 'success');
      setMarks('');
      setStudentId('');
      setCourseId('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to upload grade', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Grades</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit academic performance results for students.</p>
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
            <label>Assessment Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="capitalize"
            >
              {examTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label>Awarded Marks (0-100)</label>
            <input
              type="number"
              value={marks}
              min={0}
              max={100}
              onChange={(e) => setMarks(e.target.value)}
              placeholder="e.g. 85"
              required
            />
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
                Uploading Record...
              </>
            ) : (
              'Save Academic Record'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherGradeUploader;
