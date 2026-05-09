// Shared styled loading spinner for all dashboard pages
const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800" />
      <div className="w-16 h-16 rounded-full border-4 border-t-blue-600 dark:border-t-blue-400 animate-spin absolute top-0 left-0" />
    </div>
    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide">{message}</p>
  </div>
);

export default LoadingScreen;
