"use client";

import { useEffect, useState } from 'react';
import Footer from '../../../components/Footer';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/admin/reports', { credentials: 'include' })
      .then(r => r.json()).then(setReports).catch(()=>{});
    fetch('http://localhost:4000/admin/departments', { credentials: 'include' })
      .then(r => r.json()).then(setDepartments).catch(()=>{});
    fetch('http://localhost:4000/admin/dashboard', { credentials: 'include' })
      .then(r => r.json()).then(setSummary).catch(()=>{});
  }, []);

  async function assign(reportId) {
    setAssigningId(reportId);
    try {
      const res = await fetch('http://localhost:4000/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportId }) // department resolved by rules/category
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Assigned to ${data.worker.name} (${data.worker.workerId})`);
        // refresh
        fetch('http://localhost:4000/admin/reports', { credentials: 'include' })
          .then(r => r.json()).then(setReports).catch(()=>{});
      } else {
        alert(data.error || 'Failed');
      }
    } finally {
      setAssigningId(null);
    }
  }
  

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <div className="text-sm text-gray-600">Departments: {departments.map(d=>d.name).join(', ')}</div>
            {summary && (
              <div className="flex gap-3 text-sm">
                <div className="px-2 py-1 rounded bg-gray-100">Total: {summary.total}</div>
                <div className="px-2 py-1 rounded bg-amber-100">Open: {summary.open}</div>
                <div className="px-2 py-1 rounded bg-emerald-100">Resolved: {summary.resolved}</div>
              </div>
            )}
            <div className="grid gap-3">
              {reports.map(r => {
                const a = r.assignment;
                const now = Date.now();
                const overdue = a && a.slaDeadline && new Date(a.slaDeadline).getTime() < now && (a.status !== 'resolved');
                return (
                  <div key={r._id} className="border rounded p-3">
                    <div className="font-medium flex items-center gap-2">
                      <span>{r.category}</span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-200">{r.status || 'new'}</span>
                      {a && a.status === 'scheduled' && (
                        <span className="text-xs px-2 py-1 rounded bg-indigo-100">Scheduled {a.effectiveAt ? new Date(a.effectiveAt).toLocaleString() : ''}</span>
                      )}
                      {overdue && (
                        <span className="text-xs px-2 py-1 rounded bg-red-100">Overdue</span>
                      )}
                      {r.status === 'unresolved' && (
                        <span className="text-xs px-2 py-1 rounded bg-amber-100">Unresolved</span>
                      )}
                    </div>
                    <div className="text-sm mt-1 line-clamp-2">{r.description}</div>
                    {a && (
                      <div className="text-xs text-gray-600 mt-1">Assigned to: {a.assignedTo || 'TBD'} | SLA: {a.slaDeadline ? new Date(a.slaDeadline).toLocaleString() : '-'}</div>
                    )}
                    <div className="mt-2 flex gap-2">
                      <a className="px-3 py-1 rounded bg-gray-100" href={`/reports/${r._id}`}>Open</a>
                      <button onClick={()=>assign(r._id)} className="px-3 py-1 rounded bg-blue-600 text-white" disabled={assigningId===r._id}>Assign</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}





