import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../components/ToastProvider';
import { API_BASE_URL } from '../utils/config';
import { Link, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword
      });
      showToast(res.data.message || 'Password reset successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="card w-full max-w-lg p-10 shadow-2xl">
        <div className="mb-10 flex flex-col items-center">
          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-blue-200 dark:border-blue-800/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-center">
            Set New Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-center px-6">
            Secure your account with a multi-character password.
          </p>
        </div>

        {!token ? (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-center">
            <p className="text-red-700 dark:text-red-400 font-medium">Invalid or expired reset token. Please request a new link.</p>
            <Link to="/forgot-password" className="mt-4 btn-secondary inline-block">Request New Link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base font-bold shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-sm font-medium text-slate-500">
          Remembered? {' '}
          <Link 
            to="/login" 
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
