import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                CAMPUS<span className="text-blue-600">COMPANION</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
                <Link to="/profile" className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.name}</span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">{user.role}</span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-400"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">{user.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-400 font-bold hover:text-blue-600 transition-colors">Dashboard</Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-400 font-bold hover:text-blue-600 transition-colors">My Profile</Link>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-2 text-red-500 font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-400 font-bold hover:text-blue-600 transition-colors">Login</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-blue-600 font-bold transition-colors">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
