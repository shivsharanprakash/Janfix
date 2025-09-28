"use client";

import { useEffect, useRef, useState } from 'react';
import VoiceInput from '../../../components/VoiceInput';
import MapView from '../../../components/MapView';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const API_BASE = 'http://localhost:4000';

export default function NewReport() {
  const [coords, setCoords] = useState(null);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle|prompt|granted|denied
  const [reporterName, setReporterName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pothole');
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [dupCandidates, setDupCandidates] = useState([]);
  const [confirmUnique, setConfirmUnique] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkPermission() {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          if (cancelled) return;
          if (status.state === 'granted') {
            setGeoStatus('granted');
            requestLocation();
          } else if (status.state === 'denied') {
            setGeoStatus('denied');
            setGpsDenied(true);
          } else {
            setGeoStatus('prompt');
          }
          status.onchange = () => {
            if (status.state === 'granted') {
              setGeoStatus('granted');
              setGpsDenied(false);
              requestLocation();
            } else if (status.state === 'denied') {
              setGeoStatus('denied');
              setGpsDenied(true);
            } else {
              setGeoStatus('prompt');
            }
          };
        } else {
          // Fallback: try requesting directly
          requestLocation();
        }
      } catch (_) {
        requestLocation();
      }
    }
    checkPermission();
    return () => { cancelled = true; };
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) {
      setGpsDenied(true);
      setGeoStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsDenied(false);
        setGeoStatus('granted');
        openCamera();
      },
      () => {
        setGpsDenied(true);
        setGeoStatus('denied');
      },
      { enableHighAccuracy: true }
    );
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFiles(prev => [...prev, file]);
    }, 'image/jpeg', 0.85);
  }

  function onFileChange(e) {
    const list = Array.from(e.target.files || []);
    if (list.length) setFiles(prev => [...prev, ...list]);
  }

  async function checkDuplicateBeforeSubmit() {
    if (!coords) return [];
    const qs = new URLSearchParams({
      lat: String(coords.lat),
      lng: String(coords.lng),
      category
    }).toString();
    const res = await fetch(`${API_BASE}/api/reports/duplicate-check?${qs}`, { cache: 'no-store' });
    const data = await res.json();
    return data.data || [];
  }

  async function submitReport(e) {
    e.preventDefault();
    if (!coords) return;
    if (!confirmUnique) {
      try {
        const dup = await checkDuplicateBeforeSubmit();
        if (dup.length > 0) {
          setDupCandidates(dup);
          return; // show prompt first
        }
      } catch (_) {}
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('reporterName', reporterName);
      form.append('description', description);
      form.append('category', category);
      form.append('lat', String(coords.lat));
      form.append('lng', String(coords.lng));
      files.forEach(f => form.append('files', f));
      const res = await fetch(`${API_BASE}/api/reports`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSubmittedId(data.id);
      setFiles([]);
      setDupCandidates([]);
      setConfirmUnique(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">Report an Issue</h2>

      {coords && <MapView center={[coords.lat, coords.lng]} markers={[{ lat: coords.lat, lng: coords.lng }]} />}
      {!coords && (
        <div className="p-3 bg-amber-50 text-amber-800 rounded flex items-center justify-between gap-2">
          <span>{geoStatus === 'denied' ? 'Location blocked. Enable it in site settings and retry.' : 'Location is required to submit.'}</span>
          <button type="button" onClick={requestLocation} className="px-3 py-1 rounded bg-amber-600 text-white">Enable Location</button>
        </div>
      )}

      <form onSubmit={submitReport} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input value={reporterName} onChange={e => setReporterName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="pothole">Pothole</option>
            <option value="garbage">Garbage/Sanitation</option>
            <option value="streetlight">Street (Streetlight)</option>
            <option value="sewage">Sewage/Drain</option>
            <option value="water">Water/Waterlogging</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} placeholder="Describe the issue" />
          <div className="mt-2">
            <VoiceInput onResult={(t) => setDescription(prev => (prev ? prev + ' ' : '') + t)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Camera</label>
          <video ref={videoRef} autoPlay playsInline className="w-full rounded bg-black" />
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={capturePhoto} disabled={!cameraReady} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50">Capture</button>
            <label className="px-3 py-2 rounded bg-gray-100 border cursor-pointer">
              <input type="file" accept="image/*" capture="environment" multiple onChange={onFileChange} className="hidden" />
              Upload from Camera/Gallery
            </label>
          </div>
          {files.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {files.map((f, i) => (
                <div key={i} className="text-xs p-2 border rounded">{f.name}</div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={!coords || gpsDenied || submitting} className="w-full py-2 rounded bg-emerald-600 text-white disabled:opacity-50">
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
      </form>

  {dupCandidates.length > 0 && (
    <div className="p-3 bg-amber-50 text-amber-800 rounded space-y-2">
      <div className="font-medium">Similar issues near your location:</div>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {dupCandidates.map(d => (
          <li key={d._id}>
            <a className="underline" href={`/reports/${d._id}`} target="_blank">{d.category}</a> — {d.status}
          </li>
        ))}
      </ul>
      <div className="text-sm">Is your problem unique?</div>
      <div className="flex gap-2">
        <button onClick={()=>{ setConfirmUnique(true); submitReport(new Event('submit')); }} className="px-3 py-1 rounded bg-blue-600 text-white">Yes, continue</button>
        <button onClick={()=>{ setDupCandidates([]); }} className="px-3 py-1 rounded bg-gray-200">No, cancel</button>
      </div>
    </div>
  )}

      {submittedId && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded">
          Submitted! <a className="underline" href={`/reports/${submittedId}`}>View report</a>
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

