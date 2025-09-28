"use client";

import { useEffect, useRef, useState } from 'react';
import MapView from '../../../components/MapView';
import MediaViewer from '../../../components/MediaViewer';
import Footer from '../../../components/Footer';

export default function WorkerAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [coords, setCoords] = useState(null);
  const videoRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [picked, setPicked] = useState(null);
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/worker/assignments', { credentials: 'include' })
      .then(r => r.json()).then(setAssignments).catch(()=>{});
    navigator.geolocation.getCurrentPosition(p => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }), ()=>{}, { enableHighAccuracy: true });
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; });
  }, []);

  function capture() {
    const video = videoRef.current; if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(b => setCaptured(new File([b], `fixed-${Date.now()}.jpg`, { type: 'image/jpeg' })), 'image/jpeg', 0.9);
  }

  function onPick(e) {
    const f = (e.target.files && e.target.files[0]) || null;
    setPicked(f || null);
  }

  async function resolve(assignmentId) {
    const imageFile = captured || picked;
    if (!coords || !imageFile) { alert('Need location and a fixed image'); return; }
    setWorkingId(assignmentId);
    try {
      const form = new FormData();
      form.append('assignmentId', assignmentId);
      form.append('lat', String(coords.lat));
      form.append('lng', String(coords.lng));
      form.append('fixedImage', imageFile);
      const res = await fetch('http://localhost:4000/worker/resolve', { method: 'POST', credentials: 'include', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      alert(data.message);
    } catch (e) { alert(e.message); }
    finally { setWorkingId(null); }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Assignments</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Camera</label>
              <video ref={videoRef} autoPlay playsInline className="w-full rounded bg-black" />
              <div className="flex gap-2 mt-2">
                <button onClick={capture} className="px-3 py-2 rounded bg-blue-600 text-white">Capture Fixed Image</button>
                <label className="px-3 py-2 rounded bg-gray-100 border cursor-pointer">
                  <input type="file" accept="image/*" capture="environment" onChange={onPick} className="hidden" />
                  Upload from Camera/Gallery
                </label>
              </div>
              {(captured || picked) && <div className="text-xs mt-1">{(captured || picked).name}</div>}
            </div>
            <div className="grid gap-4">
              {assignments.map(a => (
                <div key={a._id} className="border rounded p-4">
                  <div className="font-medium text-lg">{a.report?.category || 'Unknown Category'} - Assignment {a._id}</div>
                  <div className="text-sm text-gray-600 mb-3">Status: {a.status} | SLA Deadline: {a.slaDeadline ? new Date(a.slaDeadline).toLocaleString() : 'Not set'}</div>
                  
                  {a.report && (
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium text-sm">Description:</div>
                        <div className="text-sm text-gray-700">{a.report.description || 'No description provided'}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-sm">Reporter:</div>
                        <div className="text-sm text-gray-700">{a.report.reporterName || 'Anonymous'} {a.report.phone && `(${a.report.phone})`}</div>
                      </div>
                      
                      {a.report.location?.coordinates && (
                        <div>
                          <div className="font-medium text-sm">Location:</div>
                          <div className="h-48 rounded overflow-hidden">
                            <MapView 
                              center={[a.report.location.coordinates[1], a.report.location.coordinates[0]]} 
                              markers={[{ 
                                lat: a.report.location.coordinates[1], 
                                lng: a.report.location.coordinates[0], 
                                category: a.report.category,
                                popup: a.report.description 
                              }]} 
                            />
                          </div>
                        </div>
                      )}
                      
                      {a.report.media && a.report.media.length > 0 && (
                        <div>
                          <div className="font-medium text-sm">Before Images:</div>
                          <MediaViewer media={a.report.media} />
                        </div>
                      )}
                      
                      {a.report.fixedMedia && a.report.fixedMedia.length > 0 && (
                        <div>
                          <div className="font-medium text-sm">After Images:</div>
                          <MediaViewer media={a.report.fixedMedia} />
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Created: {a.report.createdAt ? new Date(a.report.createdAt).toLocaleString() : 'Unknown'} | 
                        Updated: {a.report.updatedAt ? new Date(a.report.updatedAt).toLocaleString() : 'Unknown'}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t">
                    <button onClick={()=>resolve(a._id)} disabled={workingId===a._id} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">
                      {workingId===a._id ? 'Submitting...' : 'Submit Resolution'}
                    </button>
                  </div>
                </div>
              ))}
              {assignments.length===0 && <div className="text-sm text-gray-600">No assignments.</div>}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

