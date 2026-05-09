import { useEffect, useState } from 'react';
import { subscribeToActivity } from '../services/firestoreService';

const typeIcons = {
  userCreated: { icon: '👤', color: 'bg-blue-100 text-blue-600' },
  userUpdated: { icon: '✏️', color: 'bg-amber-100 text-amber-600' },
  userDeleted: { icon: '🗑️', color: 'bg-red-100 text-red-600' },
  courseCreated: { icon: '📚', color: 'bg-green-100 text-green-600' },
  courseUpdated: { icon: '⚙️', color: 'bg-purple-100 text-purple-600' },
  courseDeleted: { icon: '❌', color: 'bg-red-100 text-red-600' },
  gradeAdded: { icon: '📝', color: 'bg-blue-100 text-blue-600' },
  gradeUpdated: { icon: '📊', color: 'bg-indigo-100 text-indigo-600' },
  attendanceMarked: { icon: '✅', color: 'bg-green-100 text-green-600' },
  assignmentCreated: { icon: '📋', color: 'bg-orange-100 text-orange-600' },
  assignmentDeleted: { icon: '🗑️', color: 'bg-red-100 text-red-600' },
  default: { icon: '🔔', color: 'bg-slate-100 text-slate-600' },
};

const timeAgo = (ts) => {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToActivity((items) => setActivities(items));
    return () => unsubscribe();
  }, []);

  return (
    <div className="card flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Recent Activity</h3>
          <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">LIVE</span>
        </div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-8">No recent activity.</p>
        ) : (
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const { icon, color } = typeIcons[activity.type] || typeIcons.default;
              return (
                <div key={activity.id} className="relative pl-8 pb-6 last:pb-0">
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[15px] top-[30px] bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800"></div>
                  )}
                  <div className={`absolute left-0 top-1 w-8 h-8 rounded-full ${color} flex items-center justify-center text-sm z-10 border-4 border-white dark:border-slate-900`}>
                    {icon}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{activity.type?.replace(/([A-Z])/g, ' $1') || 'Activity'}</p>
                      <span className="text-[10px] font-medium text-slate-400">{timeAgo(activity.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
        <p className="text-center text-xs text-slate-400">Powered by Firebase Firestore</p>
      </div>
    </div>
  );
};

export default ActivityFeed;
