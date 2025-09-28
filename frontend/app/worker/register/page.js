"use client";

import { useEffect, useState } from 'react';
import Footer from '../../../components/Footer';

const DEPARTMENT_CODES = [
  { code: 'P101', label: 'Potholes/Road' },
  { code: 'SV202', label: 'Sewage' },
  { code: 'S303', label: 'Street' },
  { code: 'G404', label: 'Garbage/Sanitation' },
  { code: 'W505', label: 'Water' }
];

export default function WorkerRegister() {
  const [name, setName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('P101');
  const [departmentId, setDepartmentId] = useState('');
  const [workerId, setWorkerId] = useState('MNC100001');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverDepts, setServerDepts] = useState([]);

  useEffect(() => {
    // Load departments from backend so we have _id and code
    fetch('http://localhost:4000/admin/departments')
      .then(r => r.json())
      .then(arr => Array.isArray(arr) ? setServerDepts(arr) : setServerDepts([]))
      .catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/worker/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, departmentCode, departmentId, workerId, phone, username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      alert('Registered successfully. You can login now.');
      window.location.href = '/worker/login';
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <form onSubmit={submit} className="space-y-3">
            <h2 className="text-xl font-semibold">Worker Registration</h2>
            <input className="w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" />
            <select className="w-full border rounded px-3 py-2" value={departmentCode} onChange={e=>setDepartmentCode(e.target.value)}>
              {DEPARTMENT_CODES.map(d => <option key={d.code} value={d.code}>{d.code} — {d.label}</option>)}
            </select>
            <select className="w-full border rounded px-3 py-2" value={departmentId} onChange={e=>setDepartmentId(e.target.value)}>
              <option value="">Select Department (from server)</option>
              {serverDepts.map(d => <option key={d._id} value={d._id}>{d.code} — {d.name}</option>)}
            </select>
            <input className="w-full border rounded px-3 py-2" value={workerId} onChange={e=>setWorkerId(e.target.value.toUpperCase())} placeholder="Worker ID (MNC100001 - MNC104000)" />
            <input className="w-full border rounded px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone Number" />
            <input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
            <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
            <button disabled={loading} type="submit" className="w-full py-2 rounded bg-emerald-600 text-white">{loading ? 'Registering...' : 'Register'}</button>
            <div className="text-sm text-gray-600">
              Already have an account? <a className="text-blue-700 underline" href="/worker/login">Login</a>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}


