const GpaCard = ({ gpa }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{gpa ?? 0}</p>
        </div>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
        Calculated from all sessions.
      </p>
    </div>
  );
};

export default GpaCard;