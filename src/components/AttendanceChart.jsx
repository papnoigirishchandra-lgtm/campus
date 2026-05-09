import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const AttendanceChart = ({ attendanceData }) => {
  const chartData = attendanceData?.map((entry) => ({
    name: entry.courseName,
    attendance: entry.attendancePercentage
  })) || [];

  return (
    <div className="w-full h-[250px] flex flex-col">
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-400 italic">No attendance records found.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value}% Attendance`, 'Status']} 
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AttendanceChart;