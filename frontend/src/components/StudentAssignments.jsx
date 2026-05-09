import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from './ToastProvider';
import { API_BASE_URL } from '../utils/config';

const StudentAssignments = ({ token }) => {
  const [assignments, setAssignments] = useState([]);
  const [submission, setSubmission] = useState({ assignmentId: '', fileUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/assignments/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data.assignments || []);
    } catch (error) {
      showToast('Failed to load assignments', 'error');
    }
  };

  useEffect(() => { fetchAssignments(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submission.assignmentId || !submission.fileUrl) {
      showToast('Select an assignment and upload a file', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/assignments/submit`,
        submission,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Submitted successfully', 'success');
    } catch (error) {
      showToast('Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSubmission((prev) => ({ ...prev, fileUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full space-y-8">
      {/* Submit Assignment Form */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Assignment</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload your completed work for review.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Target Assignment</label>
            <select
              value={submission.assignmentId}
              onChange={(e) => setSubmission((prev) => ({ ...prev, assignmentId: e.target.value }))}
              required
            >
              <option value="">Select an assignment</option>
              {assignments.map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title} (due {new Date(assignment.dueDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload File <span className="text-xs font-normal text-slate-400">(.PDF, .JPG, .PNG)</span></label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 dark:border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                    {submission.fileUrl ? <span className="font-semibold text-blue-600">File attached successfully</span> : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                  </p>
                </div>
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full md:w-auto px-10"
            >
              {submitting ? 'Processing Submission...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>

      {/* Available Assignments List */}
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
                <div key={assignment._id} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors group">
                  <div className="flex items-start justify-between">
                    <h4 className="text-md font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{assignment.title}</h4>
                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">DUE</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Due Date: {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
