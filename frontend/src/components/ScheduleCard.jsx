import React from 'react';

const ScheduleCard = () => {
  const schedule = [
    { time: '09:00 AM', subject: 'Data Structures & Algorithms', room: 'L-101', type: 'Lecture' },
    { time: '11:00 AM', subject: 'Database Management Systems', room: 'Lab-3', type: 'Practical' },
    { time: '02:00 PM', subject: 'Software Engineering', room: 'A-204', type: 'Lecture' },
    { time: '04:00 PM', subject: 'Machine Learning', room: 'Online', type: 'Seminar' },
  ];

  return (
    <div className="card flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold">Today's Schedule</h3>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {schedule.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
              <div className="flex-shrink-0 w-20">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.time}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{item.subject}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider transition-colors">{item.room}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    item.type === 'Practical' ? 'text-green-500' : 
                    item.type === 'Seminar' ? 'text-purple-500' : 'text-orange-500'
                  }`}>{item.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
        <button className="w-full text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase tracking-widest">
          View Full Timetable →
        </button>
      </div>
    </div>
  );
};

export default ScheduleCard;
