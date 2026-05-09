import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { registerWithEmail, loginWithGoogle } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
    setLoading(true);
    try {
      await registerWithEmail(email, password, name, role);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : error.message || 'Registration failed';
      showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      showToast(error.message || 'Google registration failed', 'error');
    } finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-2">
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create an account</h1>
            <p className="text-slate-500 dark:text-slate-400">Join Campus Companion to manage your academic life.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name">Full Name</label>
              <input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-11" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" placeholder="name@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="role">I am a...</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="h-11">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <button type="submit" disabled={loading || googleLoading} className="btn-primary w-full h-11">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="mx-4 text-xs font-semibold uppercase text-slate-400">or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <button type="button" onClick={handleGoogleRegister} disabled={loading || googleLoading}
              className="w-full h-11 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-3">
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.72H.94v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.96 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.34 2.82.94 4.03l3.02-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .94 4.97L3.96 7.3C4.67 5.16 6.66 3.58 9 3.58z"/></svg>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}<Link to="/login" className="text-blue-600 font-semibold hover:underline">Login here</Link>
            </p>
          </form>
        </div>
        <div className="hidden lg:flex flex-col justify-center bg-slate-100 dark:bg-slate-800 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/10 rounded-full -ml-32 -mb-32"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Start your learning journey</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xs mx-auto mb-10">Register now to access your personalized dashboard, manage attendance, and track grades with real-time insights.</p>
            <div className="grid grid-cols-2 gap-4 text-left">
              {[['20+','Subjects'],['100%','Digital'],['24/7','Access'],['Free','Updates']].map(([v,l])=>(
                <div key={l} className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="text-sm font-bold text-blue-600 mb-1">{v}</div>
                  <div className="text-xs text-slate-500">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
