import { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from './ToastProvider';
import { getAllAssignments, submitAssignment, getCoursesByStudent } from '../services/firestoreService';

const StudentAssignments = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [submission, setSubmission] = useState({ assignmentId: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // Get all assignments (in a real app, filter by enrolled courses)
        const data = await getAllAssignments();
        setAssignments(data);
      } catch (error) {
        showToast('Failed to load assignments', 'error');
      }
    };
    if (user?.uid) fetchAssignments();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submission.assignmentId) { showToast('Select an assignment', 'error'); return; }
    setSubmitting(true);
    try {
      await submitAssignment({
        assignmentId: submission.assignmentId,
        studentId: user.uid,
        studentName: user.name,
        content: submission.content,
      });
      showToast('Submitted successfully', 'success');
      setSubmission({ assignmentId: '', content: '' });
    } catch (error) {
      showToast('Submission failed', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="w-full space-y-8">
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Assignment</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload your completed work for review.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Target Assignment</label>
            <select value={submission.assignmentId} onChange={(e) => setSubmission((prev) => ({ ...prev, assignmentId: e.target.value }))} required>
              <option value="">Select an assignment</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.title} (due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Answer / Notes</label>
            <textarea value={submission.content} onChange={(e) => setSubmission((prev) => ({ ...prev, content: e.target.value }))} placeholder="Write your answer or paste a link to your work..." rows={4} />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="submit" disabled={submitting} className="btn-primary w-full md:w-auto px-10">
              {submitting ? 'Processing...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Assignments</h3>
        </div>
        <div className="p-6">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 italic">No active assignments at this time.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors group">
                  <div className="flex items-start justify-between">
                    <h4 className="text-md font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{assignment.title}</h4>
                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">DUE</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                    Due Date: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                  </p>
                  {assignment.description && (
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{assignment.description}</p>
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

export default StudentAssignments;
