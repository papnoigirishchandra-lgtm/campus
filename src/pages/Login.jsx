import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { loginWithEmail, loginWithGoogle } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate("/dashboard");
    } catch (error) {
      const msg =
        error.code === "auth/invalid-credential" || error.code === "auth/wrong-password"
          ? "Invalid email or password."
          : error.code === "auth/user-not-found"
          ? "No account found with this email."
          : error.code === "auth/too-many-requests"
          ? "Too many failed attempts. Please try again later."
          : error.message || "Login failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      showToast(error.message || "Google login failed", "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-2">

        {/* LEFT SIDE: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Please enter your details to sign in
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <label htmlFor="email">Email address</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88 3.5 3.5"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/><path d="M14.21 14.21a3 3 0 0 1-4.24-4.24"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary w-full h-11"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="mx-4 text-xs font-semibold uppercase text-slate-400">or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="w-full h-11 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.72H.94v2.33A9 9 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.96 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.34 2.82.94 4.03l3.02-2.33z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .94 4.97L3.96 7.3C4.67 5.16 6.66 3.58 9 3.58z" />
              </svg>
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            {/* REGISTER LINK */}
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE: Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-100 dark:bg-slate-800 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/10 rounded-full -ml-32 -mb-32"></div>

          <div className="relative z-10">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-8 shadow-lg shadow-blue-500/20">
              CC
            </div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Manage your academic <span className="text-blue-600">journey</span> in one place.
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <svg className="text-green-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Track attendance in real-time
              </div>
              <div className="flex items-center gap-3">
                <svg className="text-green-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                View assignments and grades
              </div>
              <div className="flex items-center gap-3">
                <svg className="text-green-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Communicate with teachers
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-12">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-slate-300 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Joined by over <span className="font-bold text-slate-900 dark:text-white">2,000+</span> students this semester.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
