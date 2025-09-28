"use client";

import { useEffect, useMemo, useState } from 'react';
import ReportCard from '../../components/ReportCard';
import MapView from '../../components/MapView';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ReportsPage({ searchParams }) {
  const category = searchParams?.category || '';
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`http://localhost:4000/api/reports${category ? `?category=${encodeURIComponent(category)}` : ''}`, { cache: 'no-store' })
      .then(r=>r.json())
      .then(d=>{ if (mounted) setReports(d.data || []); })
      .finally(()=>{ if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [category]);

  const markers = useMemo(() => (reports.map(r => ({
    lat: r.location?.coordinates?.[1],
    lng: r.location?.coordinates?.[0],
    category: r.category,
    popup: r.description
  })).filter(m => m.lat && m.lng)), [reports]);
  const heatmap = useMemo(() => markers.map(m => ({ lat: m.lat, lng: m.lng, radius: 60 })), [markers]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="space-y-6 lg:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore Issues</h2>
          <form className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select defaultValue={category} className="border rounded px-3 py-2 text-sm w-full sm:w-auto" onChange={(e)=>{ window.location.search = e.target.value ? `?category=${encodeURIComponent(e.target.value)}` : '' }}>
              <option value="">All</option>
              <option value="pothole">Pothole</option>
              <option value="garbage">Garbage/Sanitation</option>
              <option value="streetlight">Street (Streetlight)</option>
              <option value="sewage">Sewage/Drain</option>
              <option value="water">Water/Waterlogging</option>
            </select>
          </form>
      <MapView center={[markers[0]?.lat || 12.9716, markers[0]?.lng || 77.5946]} markers={markers} heatmap={heatmap} />
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
          <div className="grid gap-3">
            {reports.map(r => <ReportCard key={r._id} report={r} />)}
          </div>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-10 transform translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full opacity-10 transform -translate-x-32 translate-y-32"></div>
      </div >

      <Footer className="gap-12"/>
    </div>
  );
}






