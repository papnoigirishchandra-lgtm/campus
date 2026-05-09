import { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from './ToastProvider';
import { getAssignmentsByTeacher, createAssignment, deleteAssignment } from '../services/firestoreService';

const TeacherAssignments = ({ courses = [] }) => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [courseId, setCourseId] = useState('');
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();

  const fetchAssignments = async () => {
    if (!user?.uid) return;
    try {
      const data = await getAssignmentsByTeacher(user.uid);
      setAssignments(data);
    } catch (error) {
      showToast('Failed to load assignments', 'error');
    }
  };

  useEffect(() => { fetchAssignments(); }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const selectedCourse = courses.find((c) => c.id === courseId);
      await createAssignment({
        title,
        description,
        dueDate,
        courseId,
        courseName: selectedCourse?.courseName || '',
        teacherId: user?.uid,
      });
      showToast('Assignment created', 'success');
      setTitle(''); setDescription(''); setDueDate(''); setCourseId('');
      fetchAssignments();
    } catch (err) {
      showToast('Failed to create assignment', 'error');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      showToast('Assignment deleted', 'success');
      fetchAssignments();
    } catch (e) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Assignment</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Publish a new task for your students to complete.</p>
        </div>
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label>Assignment Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm Lab Report" required />
            </div>
            <div className="space-y-2">
              <label>Submission Deadline</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
          {courses.length > 0 && (
            <div className="space-y-2">
              <label>Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
                <option value="">Select a course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.courseName} ({c.courseCode})</option>)}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label>Task Description <span className="text-xs font-normal text-slate-400">(Optional)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide detailed instructions..." rows={4} />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="submit" disabled={creating} className="btn-primary w-full md:w-auto px-10 flex items-center justify-center gap-2">
              {creating ? <><div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>Creating...</> : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </div>

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
                <div key={assignment.id} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-md font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">{assignment.title}</h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Deadline: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(assignment.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
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
