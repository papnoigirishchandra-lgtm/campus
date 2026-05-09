import { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { getAllAnnouncements } from '../services/firestoreService';

const typeColors = {
  Exam: 'bg-red-100 text-red-600 dark:bg-red-900/30',
  Event: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
  Notice: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
  Academic: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
};

const timeAgo = (ts) => {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    getAllAnnouncements().then(setAnnouncements).catch(console.error);
  }, []);

  // Static fallback announcements if Firestore is empty
  const displayItems = announcements.length > 0 ? announcements : [
    { id: 1, title: 'Mid-term Exams Schedule Issued', type: 'Exam', createdAt: null },
    { id: 2, title: 'Campus Tech Festival Registrations Open', type: 'Event', createdAt: null },
    { id: 3, title: 'Library Closed for Maintenance this Sunday', type: 'Notice', createdAt: null },
    { id: 4, title: 'CS201 Guest Lecture Rescheduled', type: 'Academic', createdAt: null },
  ];

  return (
    <div className="card flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold">Announcements</h3>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {displayItems.map((item, index) => (
            <div key={item.id || index} className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all bg-white dark:bg-slate-900 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${typeColors[item.type] || 'bg-slate-100 text-slate-600'}`}>
                  {item.type || 'General'}
                </span>
                <span className="text-xs text-slate-400">{timeAgo(item.createdAt) || 'Recently'}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title || item.message}
              </h4>
              <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Read details</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
        <button className="w-full text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase tracking-widest">
          View Notice Board
        </button>
      </div>
    </div>
  );
};

export default StudentAnnouncements;
