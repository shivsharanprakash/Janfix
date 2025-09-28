"use client";

import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900">JanFix</h1>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <a href="/" className="text-blue-600">Home</a>
            <a href="/report/new" className="text-gray-600 hover:text-gray-900">Report Issue</a>
            <a href="/reports" className="text-gray-600 hover:text-gray-900">Explore Issues</a>
            <a href="/guidelines" className="text-gray-600 hover:text-gray-900">Guidelines</a>
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="/admin/login" className="text-gray-600 hover:text-gray-900 text-sm">Admin</a>
            <a href="/worker/login" className="text-gray-600 hover:text-gray-900 text-sm">Worker</a>
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <a href="/" className="block text-blue-600 font-medium">Home</a>
            <a href="/report/new" className="block text-gray-600 hover:text-gray-900">Report Issue</a>
            <a href="/reports" className="block text-gray-600 hover:text-gray-900">Explore Issues</a>
            <a href="/guidelines" className="block text-gray-600 hover:text-gray-900">Guidelines</a>
            <div className="border-t pt-2">
              <a href="/admin/login" className="block text-sm text-gray-600 hover:text-gray-900">Admin Login</a>
              <a href="/worker/login" className="block text-sm text-gray-600 hover:text-gray-900">Worker Login</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

