"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, open: 0 });

  useEffect(() => {
    fetch("http://localhost:4000/api/reports?limit=1")
      .then((r) => r.json())
      .then(() => {
        setStats({ total: 100, resolved: 85, open: 15 });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Main Section - Full width without constraints */}
      <main className="pt-24 pb-12 w-full min-h-[calc(100vh-4rem)]">
        <div className="w-full h-full px-6 lg:px-12 xl:px-24">
          <div className="flex flex-col lg:flex-row items-center justify-between h-full w-full">
            {/* Left Section (Text) - Exactly 50% width */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center lg:items-start">
              {/* Stats */}
              <div className="flex space-x-4 mb-6 lg:mb-8">
                <div className="bg-blue-100 px-4 py-2 rounded-full">
                  <span className="text-blue-800 font-medium text-sm">Issues Solved</span>
                </div>
                <div className="bg-purple-100 px-4 py-2 rounded-full">
                  <span className="text-purple-800 font-bold text-xl">{stats.resolved}</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 lg:mb-6">
                Your City,
                <br />
                Your Voice
              </h1>
              
              {/* Description */}
              <p className="text-lg sm:text-xl text-gray-600 mb-6 lg:mb-8 max-w-md leading-relaxed">
                Report issues, track progress,<br />
                and help build a cleaner, safer community.
              </p>

              {/* Buttons */}
              <div className="flex flex-row gap-4">
                <a href="/report/new" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition whitespace-nowrap">
                  Report Issue
                </a>
                <a href="/reports" className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg shadow hover:bg-gray-200 transition whitespace-nowrap">
                  View Nearby Issues
                </a>
              </div>
            </div>

            {/* Right Section (Image) - Exactly 50% width */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="w-full max-w-lg lg:max-w-full">
                <img
                  src="/Gemini_Generated_Image_g8bui9g8bui9g8bu.png"
                  alt="JanFix Illustration"
                  className="w-full h-auto rounded-lg  object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-10 translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full opacity-10 -translate-x-32 translate-y-32"></div>
      </div>

      <Footer />
    </div>
  );
}