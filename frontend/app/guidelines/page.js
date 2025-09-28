"use client";

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Guidelines() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12">
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Guidelines & Reporting Instructions</h1>
          <p className="text-base lg:text-lg text-gray-600">Follow these simple steps to ensure your issue is reported accurately and resolved quickly</p>
        </div>

        {/* Steps to Report */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">Steps to Report</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Identify the issue</h3>
              <p className="text-gray-600">Road, Garbage, Streetlight, Water, Sewage, etc.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Take a photo</h3>
              <p className="text-gray-600">Clear, well-lit images help us understand the problem better</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Pin the location</h3>
              <p className="text-gray-600">Use GPS to mark the exact location of the issue</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Add Description</h3>
              <p className="text-gray-600">Provide detailed information about the issue</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Submit & Track</h3>
              <p className="text-gray-600">Submit your report and track its progress</p>
            </div>
          </div>
        </div>

        {/* Do's and Don'ts */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">Do's & Don'ts</h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800 mb-4">Do's</h3>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Be Specific
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Use clear images
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Categorize properly
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Provide accurate location
                </li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-red-800 mb-4">Don'ts</h3>
              <ul className="space-y-2 text-red-700">
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  Fake/Duplicate reports
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  Offensive content
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  Multiple records for same issue
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  Blurry or unclear photos
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <a 
            href="/report/new" 
            className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Report New Issue Now
          </a>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 transform translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full opacity-20 transform -translate-x-32 translate-y-32"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gray-100 rounded-full opacity-20 transform -translate-x-16 -translate-y-16"></div>
      </div>

      <Footer />
    </div>
  );
}
