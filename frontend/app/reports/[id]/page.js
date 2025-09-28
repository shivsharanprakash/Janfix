"use client";

import { useEffect, useState } from 'react';
import MediaViewer from '../../../components/MediaViewer';
import MapView from '../../../components/MapView';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function ReportDetail({ params }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`http://localhost:4000/api/reports/${params.id}`, { cache: 'no-store' });
        if (!res.ok) {
          setReport(null);
          return;
        }
        const data = await res.json();
        setReport(data);
      } catch (error) {
        console.error('Error fetching report:', error);
        setReport(null);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!report) return <div className="min-h-screen flex items-center justify-center">Not found</div>;
  
  const coords = report.location?.coordinates;
  const lng = coords?.[0];
  const lat = coords?.[1];
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="space-y-4 lg:space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Report Detail</h2>
      <Progress status={report.status} stage={report.stage} />
      <div className="border rounded p-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{report.category}</div>
          <span className="text-xs px-2 py-1 rounded bg-gray-200">{report.status || 'new'}</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Stage: {report.stage || '-'} {report.assignmentStatus && `| Assignment: ${report.assignmentStatus}`} {report.dueDate && `| Due: ${new Date(report.dueDate).toLocaleString()}`}
        </div>
        <div className="mt-2 text-sm">{report.description}</div>
      </div>
      {lat && lng && <MapView center={[lat, lng]} markers={[{ lat, lng, category: report.category }]} />}
      <div>
        <h3 className="font-medium mb-2">Before</h3>
        <MediaViewer media={report.media || []} />
      </div>
      {report.fixedMedia && report.fixedMedia.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">After</h3>
          <MediaViewer media={report.fixedMedia} />
        </div>
      )}
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-10 transform translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full opacity-10 transform -translate-x-32 translate-y-32"></div>
      </div>

      <Footer />
    </div>
  );
}

function Progress({ status, stage }) {
  const steps = ['citizen', 'admin', 'worker', 'completed'];
  const idx = Math.max(0, steps.indexOf(stage || 'citizen'));
  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-500 rounded" style={{ width: `${(idx / (steps.length - 1)) * 100}%` }} />
      </div>
      <div className="text-xs text-gray-600 mt-1">Stage: {stage || '-'} | Status: {status || '-'}</div>
    </div>
  );
}






