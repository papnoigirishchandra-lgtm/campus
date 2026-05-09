import { useEffect, useState } from 'react';
import AdminUserTable from '../components/AdminUserTable';
import AdminCourseCreator from '../components/AdminCourseCreator';
import AdminTeacherManagement from '../components/AdminTeacherManagement';
import AdminStatsCharts from '../components/AdminStatsCharts';
import ActivityFeed from '../components/ActivityFeed';
import LoadingScreen from '../components/LoadingScreen';
import { getAdminReports, getAllUsers } from '../services/firestoreService';

const AdminDashboard = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  const fetchReports = async () => {
    try {
      const data = await getAdminReports();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <LoadingScreen message="Loading admin dashboard..." />;

  const tabs = [
    { id: 'stats', label: 'Statistics' },
    { id: 'users', label: 'User Management' },
    { id: 'teachers', label: 'Teacher Management' },
    { id: 'courses', label: 'Course Management' },
    { id: 'reports', label: 'Reports' },
  ];

  const exportUsersCSV = async () => {
    try {
      const users = await getAllUsers();
      const headers = ['Name', 'Email', 'Role'];
      const rows = users.map((u) => [u.name, u.email, u.role]);
      const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'users.csv';
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">System overview and management control center.</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800/30">
          System Administrator
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

      <div className="space-y-6">
        {activeTab === 'stats' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="card">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold">System Summary</h2>
                    <span className="text-xs font-semibold text-slate-400">Firestore Stats</span>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { label: 'Total Users', value: (reports.userStatistics?.student || 0) + (reports.userStatistics?.teacher || 0) + (reports.userStatistics?.admin || 0) },
                        { label: 'Total Courses', value: reports.courseStatistics?.totalCourses || 0 },
                        { label: 'Average Marks', value: reports.gradeStatistics?.averageMarks?.toFixed(1) || 0 },
                        { label: 'Total Grades', value: reports.gradeStatistics?.totalGrades || 0 },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl p-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card p-6">
                  <AdminStatsCharts reports={reports} />
                </div>
              </div>
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <AdminUserTable onRefresh={fetchReports} />
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="card">
            <AdminTeacherManagement />
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="card">
            <AdminCourseCreator onRefresh={fetchReports} />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="text-lg font-bold">Comprehensive Reports</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate and export detailed system performance summaries.</p>
            </div>
            <div className="p-6 space-y-8">
              <button onClick={exportUsersCSV} className="btn-primary flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Export Users (.CSV)
              </button>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Attendance Metrics</h4>
                  <div className="space-y-3">
                    {['present', 'absent', 'late'].map((s) => (
                      <div key={s} className="flex justify-between text-sm">
                        <span className="text-slate-500 capitalize">{s}</span>
                        <span className="font-semibold">{reports.attendanceStatistics?.[s] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Grade Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Highest</span><span className="font-semibold text-green-600">{reports.gradeStatistics?.highestMark || 0}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Lowest</span><span className="font-semibold text-red-600">{reports.gradeStatistics?.lowestMark || 0}</span></div>
                    <div className="flex justify-between text-sm border-t border-slate-100 dark:border-slate-800 pt-3"><span className="text-slate-500">Total Recorded</span><span className="font-semibold">{reports.gradeStatistics?.totalGrades || 0}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
