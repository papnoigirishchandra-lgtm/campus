import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import GpaCard from '../components/GpaCard';
import AttendanceChart from '../components/AttendanceChart';
import GradesTable from '../components/GradesTable';
import PerformanceChart from '../components/PerformanceChart';
import GradeTrendChart from '../components/GradeTrendChart';
import SubjectPerformanceChart from '../components/SubjectPerformanceChart';
import StudentAssignments from '../components/StudentAssignments';
import ScheduleCard from '../components/ScheduleCard';
import StudentAnnouncements from '../components/StudentAnnouncements';
import LoadingScreen from '../components/LoadingScreen';
import { getGradesByStudent, getStudentAnalytics } from '../services/firestoreService';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [grades, setGrades] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  const resources = [
    { title: 'Digital Library', icon: '📚', description: 'Access thousands of journals and e-books.' },
    { title: 'Academic Calendar', icon: '📅', description: 'Important dates for the current semester.' },
    { title: 'Student Handbook', icon: '📜', description: 'University rules and guidelines.' },
    { title: 'Software Center', icon: '💻', description: 'Free licenses for educational tools.' },
  ];

  useEffect(() => {
    if (!user?.uid) return;
    const fetchData = async () => {
      try {
        const [gradesData, analyticsData] = await Promise.all([
          getGradesByStudent(user.uid),
          getStudentAnalytics(user.uid),
        ]);
        setGrades(gradesData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching student data:', error);
        showToast('Failed to load some dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <LoadingScreen message="Loading your dashboard..." />;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Student Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800/30">
            {user?.department || 'General'}
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6 flex flex-col justify-between min-h-[220px]">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Current Standing</h3>
          <GpaCard gpa={analytics.summary?.averageGrade} />
        </div>
        <div className="card p-6 flex flex-col justify-between min-h-[350px]">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Attendance Overview</h3>
          <AttendanceChart attendanceData={analytics.courseAttendance || []} />
        </div>
        <div className="card p-6 flex flex-col justify-between min-h-[350px]">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Performance Analytics</h3>
          <PerformanceChart analytics={analytics} />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="card p-6 min-h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Performance Trends</h3>
          <GradeTrendChart trends={analytics.performanceTrends || []} />
        </div>
        <div className="card p-6 min-h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Subject Performance</h3>
          <SubjectPerformanceChart subjectPerformance={analytics.subjectPerformance || []} />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">Recent Grades</h3>
              <span className="text-xs font-semibold text-slate-400">{grades.length} Grades Recorded</span>
            </div>
            <div className="p-0 overflow-x-auto">
              <GradesTable grades={grades} />
            </div>
          </div>

          <div className="card">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">Educational Resources</h3>
            </div>
            <div className="p-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
              {resources.map((res, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group bg-white dark:bg-slate-900 shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{res.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{res.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{res.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ScheduleCard />
          <StudentAnnouncements />
          <div className="card flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">Quick Insights</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              {[
                { label: 'Total Grades', value: analytics.summary?.totalGrades || 0, color: 'blue' },
                { label: 'Overall Attendance', value: `${analytics.summary?.overallAttendancePercentage || 0}%`, color: 'green' },
                { label: 'Average Points', value: analytics.summary?.averageGrade || 0, color: 'orange' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 flex items-center justify-center border border-${color}-100 dark:border-${color}-800/30`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Upcoming Assignments</h2>
        <div className="card">
          <StudentAssignments />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
