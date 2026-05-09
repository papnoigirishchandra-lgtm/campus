import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { initSocket } from '../utils/socket';
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
import { API_BASE_URL } from '../utils/config';

const StudentDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState({});
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
    const fetchData = async () => {
      try {
        const [dashboardRes, gradesRes, analyticsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/student/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/student/grades`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/student/performance-analytics`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setDashboard(dashboardRes.data);
        setGrades(gradesRes.data.grades || []);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const socket = initSocket();

    const onGradeUpdated = (payload) => {
      if (payload.studentId === user?.id) {
        showToast(`New grade recorded (${payload.examType}): ${payload.marks}`, 'success');
        fetchData();
      }
    };

    const onAttendanceUpdated = (payload) => {
      if (payload.studentId === user?.id) {
        showToast(`Attendance updated for ${new Date(payload.date).toLocaleDateString()}: ${payload.status}`, 'info');
        fetchData();
      }
    };

    socket.on('gradeUpdated', onGradeUpdated);
    socket.on('attendanceUpdated', onAttendanceUpdated);

    return () => {
      socket.off('gradeUpdated', onGradeUpdated);
      socket.off('attendanceUpdated', onAttendanceUpdated);
    };
  }, [token, user, showToast]);

  if (loading) return <LoadingScreen message="Loading your dashboard..." />;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Student Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome back, {user?.name}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800/30">
            Semester {dashboard.semester || 1}
          </div>
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
            {dashboard.department || 'General'}
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6 flex flex-col justify-between min-h-[220px]">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Current Standing</h3>
          <GpaCard gpa={dashboard.gpa} />
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

          {/* Resources Section */}
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
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Grades</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.summary?.totalGrades || 0}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Attendance</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.summary?.overallAttendancePercentage || 0}%</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-100 dark:border-green-800/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="19 8 12 15 9 12"/></svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Points</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.summary?.averageGrade || 0}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-800/30">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Upcoming Assignments</h2>
        <div className="card">
          <StudentAssignments token={token} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
