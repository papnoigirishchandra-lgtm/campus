import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../components/ToastProvider';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../utils/config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/request-password-reset`, { email });
      showToast(res.data.message || 'Reset instructions sent', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to request reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="card w-full max-w-lg p-10 shadow-2xl">
        <div className="mb-10 flex flex-col items-center">
          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-blue-200 dark:border-blue-800/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3z"/></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-center">
            Recover Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-center px-6">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Registered Email</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
                Sending Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
