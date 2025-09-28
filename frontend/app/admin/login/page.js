"use client";

import { useState } from 'react';
import Footer from '../../../components/Footer';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      window.location.href = '/admin/dashboard';
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <form onSubmit={submit} className="space-y-3">
            <h2 className="text-xl font-semibold">Admin Login</h2>
            <input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
            <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
            <button type="submit" disabled={loading} className="w-full py-2 rounded bg-blue-600 text-white">{loading ? 'Logging in…' : 'Login'}</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}











