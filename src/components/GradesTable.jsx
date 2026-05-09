const GradesTable = ({ grades }) => {
  return (
    <div className="w-full">
      {grades.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No grades available yet.
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Course</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Exam</th>
              <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider">Marks</th>
              <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600 dark:text-slate-300">
            {grades.map((grade, index) => (
              <tr key={index} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                  {grade.courseId?.courseName || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/20 capitalize">
                    {grade.examType}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                  {grade.marks}
                </td>
                <td className="px-6 py-4 text-right tabular-nums">
                  {new Date(grade.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GradesTable;