import React from 'react';

const ActivityFeed = () => {
  const activities = [
    { user: 'James Miller', action: 'submitted assignment', target: 'CS201 Fundamentals', time: '12m ago', icon: '📝', color: 'bg-blue-100 text-blue-600' },
    { user: 'Emily Davis', action: 'asked a doubt', target: 'Machine Learning', time: '45m ago', icon: '❓', color: 'bg-amber-100 text-amber-600' },
    { user: 'System', action: 'published midterm results', target: 'All Courses', time: '2h ago', icon: '📢', color: 'bg-green-100 text-green-600' },
    { user: 'Prof. Robert', action: 'updated syllabus', target: 'Software Engineering', time: '4h ago', icon: '⚙️', color: 'bg-purple-100 text-purple-600' },
    { user: 'Mia Anderson', action: 'marked as late', target: 'Digital Electronics', time: '5h ago', icon: '⏰', color: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="card flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Recent Activity</h3>
          <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">LIVE</span>
        </div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={index} className="relative pl-8 pb-6 last:pb-0">
              {index !== activities.length - 1 && (
                <div className="absolute left-[15px] top-[30px] bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800"></div>
              )}
              <div className={`absolute left-0 top-1 w-8 h-8 rounded-full ${activity.color} flex items-center justify-center text-sm z-10 border-4 border-white dark:border-slate-900`}>
                {activity.icon}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.user}</p>
                  <span className="text-[10px] font-medium text-slate-400">{activity.time}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activity.action} <span className="font-bold text-slate-700 dark:text-slate-300">"{activity.target}"</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
        <button className="w-full text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase tracking-widest">
          View All Logs
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
