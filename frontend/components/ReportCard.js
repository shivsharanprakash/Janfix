export default function ReportCard({ report }) {
  const created = report.createdAt ? new Date(report.createdAt).toLocaleString() : '';
  return (
    <a href={`/reports/${report._id}`} className="block border rounded p-3 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{report.category || 'Issue'}</div>
        <span className="text-xs px-2 py-1 rounded bg-gray-200">{report.status || 'new'}</span>
      </div>
      <div className="text-sm text-gray-700 mt-1">{report.description}</div>
      <div className="text-xs text-gray-500 mt-2">{created}</div>
    </a>
  );
}

