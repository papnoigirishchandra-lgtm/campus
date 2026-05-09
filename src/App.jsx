import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import AuthContext from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import Seeder from './pages/Seeder';

// Role-based dashboard router
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'teacher') return <TeacherDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return <div className="p-6 text-red-500">Unauthorized role.</div>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
              <Navbar />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route path="/seed" element={<Seeder />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;