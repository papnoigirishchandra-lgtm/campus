import { useCallback, useEffect, useState } from 'react';
import { useToast } from './ToastProvider';
import { getAllCourses, createCourse, updateCourse, deleteCourse, getUsersByRole } from '../services/firestoreService';

const AdminCourseCreator = ({ onRefresh }) => {
  const { showToast } = useToast();
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesData, teachersData] = await Promise.all([
        getAllCourses(),
        getUsersByRole('teacher'),
      ]);
      setCourses(coursesData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => { setCourseName(''); setCourseCode(''); setTeacherId(''); setEditingCourse(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const teacher = teachers.find((t) => t.id === teacherId);
      const payload = { courseName, courseCode, teacherId, teacherName: teacher?.name || '' };
      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
        showToast('Course updated successfully', 'success');
      } else {
        await createCourse(payload);
        showToast('Course created successfully', 'success');
      }
      resetForm();
      fetchData();
      if (onRefresh) onRefresh();
    } catch (error) {
      showToast(error.message || 'Failed to save course', 'error');
    } finally { setSaving(false); }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setCourseName(course.courseName);
    setCourseCode(course.courseCode);
    setTeacherId(course.teacherId || '');
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(id);
      showToast('Course deleted successfully', 'success');
      fetchData();
      if (onRefresh) onRefresh();
    } catch (error) {
      showToast(error.message || 'Failed to delete course', 'error');
    }
  };

  const filtered = courses.filter((c) =>
    c.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    c.courseCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{editingCourse ? 'Update the details for this course.' : 'Add a new subject to the university catalog.'}</p>
      </div>
      <div className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label>Course Name</label>
              <input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Advanced Data Structures" required />
            </div>
            <div className="space-y-2">
              <label>Course Code</label>
              <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CS301" required />
            </div>
          </div>
          <div className="space-y-2">
            <label>Assigned Instructor</label>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
              <option value="">Select a teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <button type="submit" disabled={saving} className="btn-primary min-w-[200px]">
              {saving ? (editingCourse ? 'Updating...' : 'Creating...') : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
            {editingCourse && <button type="button" onClick={resetForm} className="btn-secondary min-w-[120px]">Cancel</button>}
          </div>
        </form>

        <div className="mt-12 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div className="relative max-w-xs w-full">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className="pl-10 text-sm" />
            </div>
            <span className="text-sm text-slate-500">{filtered.length} courses</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading catalog...
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Course Details</th>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Instructor</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 dark:text-slate-300">
                  {filtered.map((course) => (
                    <tr key={course.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{course.courseName}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">{course.courseCode}</span>
                      </td>
                      <td className="px-6 py-4">
                        {course.teacherName ? (
                          <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500"></div>{course.teacherName}</div>
                        ) : <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(course)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </button>
                          <button onClick={() => handleDelete(course.id, course.courseName)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No courses found in the catalog.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourseCreator;
