"use client";

import { useState } from 'react';
import Footer from '../../../components/Footer';

export default function WorkerLogin() {
  const [username, setUsername] = useState('worker1');
  const [password, setPassword] = useState('worker123');

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/worker/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      window.location.href = '/worker/assignments';
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <form onSubmit={submit} className="space-y-3">
            <h2 className="text-xl font-semibold">Worker Login</h2>
            <input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username or Worker ID (e.g., MNC100001)" />
            <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
            <button type="submit" className="w-full py-2 rounded bg-blue-600 text-white">Login</button>
            <div className="text-sm text-gray-600">
              New worker? <a className="text-blue-700 underline" href="/worker/register">Register here</a>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

