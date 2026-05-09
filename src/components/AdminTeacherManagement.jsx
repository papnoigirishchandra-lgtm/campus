import { useCallback, useEffect, useState } from 'react';
import { useToast } from './ToastProvider';
import { getUsersByRole, getAllCourses, updateUser } from '../services/firestoreService';

const AdminTeacherManagement = () => {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [teachersData, coursesData] = await Promise.all([
        getUsersByRole('teacher'),
        getAllCourses(),
      ]);
      setTeachers(teachersData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
      showToast('Failed to load teachers.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = (teacher) => { setEditingTeacher(teacher); setEditName(teacher.name); };
  const handleCancelEdit = () => { setEditingTeacher(null); setEditName(''); };

  const handleSaveEdit = async () => {
    if (!editingTeacher) return;
    setSavingEdit(true);
    try {
      await updateUser(editingTeacher.id, { name: editName });
      showToast('Teacher updated successfully', 'success');
      handleCancelEdit();
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to update teacher', 'error');
    } finally { setSavingEdit(false); }
  };

  const getTeacherCourses = (teacherId) => courses.filter((c) => c.teacherId === teacherId);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading Teachers...
      </div>
    );
  }

  return (
    <div className="w-full">
      {editingTeacher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-6">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Edit Teacher Profile</h4>
              <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label>Full Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g., Dr. Alice Smith" />
              </div>
              <div className="space-y-2">
                <label>Email (read-only)</label>
                <input value={editingTeacher.email} disabled className="bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-500" />
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button onClick={handleSaveEdit} disabled={savingEdit} className="btn-primary w-full">
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleCancelEdit} className="btn-secondary w-full">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Teacher Management</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View teacher profiles and their assigned courses.</p>
      </div>

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => {
            const assignedCourses = getTeacherCourses(teacher.id);
            return (
              <div key={teacher.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-800/50">
                      {teacher.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <button onClick={() => handleEdit(teacher)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                  </div>
                  <h4 className="text-md font-bold text-slate-900 dark:text-white">{teacher.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{teacher.email}</p>
                  <div className="mt-5 space-y-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Courses ({assignedCourses.length})</h5>
                    {assignedCourses.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {assignedCourses.map((course) => (
                          <div key={course.id} className="text-xs flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate mr-2">{course.courseName}</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-[10px] uppercase font-bold shrink-0">{course.courseCode}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-500">No courses assigned yet.</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Teacher Access</p>
                </div>
              </div>
            );
          })}
          {teachers.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <p>No teachers found in the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTeacherManagement;
