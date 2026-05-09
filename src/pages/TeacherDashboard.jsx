import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import TeacherGradeUploader from '../components/TeacherGradeUploader';
import TeacherAttendanceMarker from '../components/TeacherAttendanceMarker';
import TeacherCourseStudents from '../components/TeacherCourseStudents';
import TeacherPerformanceReport from '../components/TeacherPerformanceReport';
import TeacherAssignments from '../components/TeacherAssignments';
import ActivityFeed from '../components/ActivityFeed';
import LoadingScreen from '../components/LoadingScreen';
import { getCoursesByTeacher } from '../services/firestoreService';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grades');

  useEffect(() => {
    if (!user?.uid) return;
    const fetchCourses = async () => {
      try {
        const data = await getCoursesByTeacher(user.uid);
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  if (loading) return <LoadingScreen message="Loading teacher dashboard..." />;

  const tabs = [
    { id: 'grades', label: 'Upload Grades' },
    { id: 'attendance', label: 'Mark Attendance' },
    { id: 'students', label: 'Course Students' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'reports', label: 'Reports' },
  ];

  // Count unique students across all courses
  const totalStudents = [...new Set(courses.flatMap((c) => c.students || []))].length;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Teacher Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome, {user?.name}. Manage your courses and students here.</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800/30">
          Active Instructor
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <div className="card p-6 flex flex-col justify-between min-h-[160px]">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Students</h3>
                <p className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-400">{totalStudents}</p>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Enrolled across {courses.length} course(s).</p>
            </div>
            <div className="card p-6 flex flex-col justify-center min-h-[160px]">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Courses</h3>
              <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{courses.length}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Current academic period</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="p-6">
              {activeTab === 'grades' && <TeacherGradeUploader courses={courses} />}
              {activeTab === 'attendance' && <TeacherAttendanceMarker courses={courses} />}
              {activeTab === 'students' && <TeacherCourseStudents courses={courses} />}
              {activeTab === 'assignments' && <TeacherAssignments courses={courses} />}
              {activeTab === 'reports' && <TeacherPerformanceReport courses={courses} />}
            </div>
          </div>
        </div>

        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
