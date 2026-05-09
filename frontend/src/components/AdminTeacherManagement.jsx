import { useCallback, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { initSocket } from '../utils/socket';
import { useToast } from './ToastProvider';
import { API_BASE_URL } from '../utils/config';

const AdminTeacherManagement = () => {
  const { token } = useContext(AuthContext);
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchTeachersAndCourses = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/all-users`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { role: 'teacher', limit: 100 } // Get all teachers
        }),
        axios.get(`${API_BASE_URL}/api/admin/all-courses`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100 } // Get all courses
        })
      ]);
      
      setTeachers(usersRes.data.users || []);
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      showToast('Failed to load teachers.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchTeachersAndCourses();
  }, [fetchTeachersAndCourses]);

  useEffect(() => {
    const socket = initSocket();
    const refresh = () => fetchTeachersAndCourses();

    socket.on('userUpdated', refresh);
    socket.on('userDeleted', refresh);
    socket.on('courseCreated', refresh);
    socket.on('courseUpdated', refresh);
    socket.on('courseDeleted', refresh);

    return () => {
      socket.off('userUpdated', refresh);
      socket.off('userDeleted', refresh);
      socket.off('courseCreated', refresh);
      socket.off('courseUpdated', refresh);
      socket.off('courseDeleted', refresh);
    };
  }, [fetchTeachersAndCourses]);

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setEditName(teacher.name);
    setEditEmail(teacher.email);
    setEditPassword('');
  };

  const handleCancelEdit = () => {
    setEditingTeacher(null);
    setEditName('');
    setEditEmail('');
    setEditPassword('');
  };

  const handleSaveEdit = async () => {
    if (!editingTeacher) return;

    setSavingEdit(true);
    try {
      const payload = {
        name: editName,
        email: editEmail,
      };
      if (editPassword) payload.password = editPassword;

      await axios.put(
        `${API_BASE_URL}/api/admin/update-user/${editingTeacher._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showToast('Teacher details updated successfully', 'success');
      handleCancelEdit();
      fetchTeachersAndCourses();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update teacher', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Helper to get courses for a teacher
  const getTeacherCourses = (teacherId) => {
    return courses.filter(course => course.teacherId?._id === teacherId || course.teacherId === teacherId);
  };

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
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-6">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Edit Teacher Profile</h4>
              <button
                onClick={handleCancelEdit}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label>Full Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Dr. Alice Smith"
                />
              </div>

              <div className="space-y-2">
                <label>Email Address</label>
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="teacher@campus.com"
                />
              </div>

              <div className="space-y-2">
                <label>Reset Password <span className="text-xs font-normal text-slate-400">(Leave blank to keep current)</span></label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="btn-primary w-full"
                >
                  {savingEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Teacher Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View teacher profiles and their assigned courses.</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => {
            const assignedCourses = getTeacherCourses(teacher._id);
            return (
              <div key={teacher._id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-800/50">
                      {teacher.name.charAt(0)}
                    </div>
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit Profile"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                  </div>
                  <h4 className="text-md font-bold text-slate-900 dark:text-white line-clamp-1">{teacher.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{teacher.email}</p>
                  
                  <div className="mt-5 space-y-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Courses ({assignedCourses.length})</h5>
                    {assignedCourses.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                        {assignedCourses.map(course => (
                          <div key={course._id} className="text-xs flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate mr-2" title={course.courseName}>{course.courseName}</span>
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
