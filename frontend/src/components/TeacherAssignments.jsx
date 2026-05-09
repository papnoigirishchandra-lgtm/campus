import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from './ToastProvider';
import { API_BASE_URL } from '../utils/config';

const TeacherAssignments = ({ token }) => {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/assignments/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data.assignments || []);
    } catch (error) {
      showToast('Failed to load assignments', 'error');
    }
  };

  useEffect(() => { fetchAssignments(); }, [token]);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/assignments`,
        { title, description, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Assignment created', 'success');
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchAssignments();
    } catch (err) {
      showToast('Failed to create assignment', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Create Assignment Form */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Assignment</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Publish a new task for your students to complete.</p>
        </div>
        <form onSubmit={create} className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label>Assignment Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Lab Report"
                required
              />
            </div>
            <div className="space-y-2">
              <label>Submission Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label>Task Description <span className="text-xs font-normal text-slate-400">(Optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed instructions for the assignment..."
              rows={4}
            />
          </div>
          
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={creating}
              className="btn-primary w-full md:w-auto px-10 flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  Creating Task...
                </>
              ) : (
                'Publish Assignment'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Published Assignments List */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Published Assignments</h3>
        </div>
        <div className="p-6">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 italic">You haven't published any assignments yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-md font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">{assignment.title}</h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Deadline: {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 uppercase">
                      {assignment.courseId?.courseCode || 'General'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {assignment.courseId?.courseName || ''}
                    </span>
                  </div>
                  {assignment.description && (
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 italic">"{assignment.description}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignments;
