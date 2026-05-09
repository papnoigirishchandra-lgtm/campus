import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const GradeTrendChart = ({ trends }) => {
  const formatPeriod = (period) => {
    const [year, month] = period.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month)-1]} ${year}`;
  };

  const chartData = trends?.map((item) => ({
    period: formatPeriod(item.period),
    average: item.averageScore
  })) || [];

  return (
    <div className="w-full h-[250px] flex flex-col">
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-400 italic">No academic trends recorded.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="period" 
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
                formatter={(value) => [`${value}% Avg`, 'Result']} 
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GradeTrendChart;
