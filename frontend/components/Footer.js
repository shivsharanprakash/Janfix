export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Branding */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">JF</span>
              </div>
              <h3 className="text-xl font-bold text-white">JanFix</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your City, Your Voice. Report issues, track progress, and help build a cleaner, safer community.
            </p>
          </div>

          {/* Report Issues */}
          <div>
            <h4 className="text-white font-semibold mb-4">REPORT ISSUES</h4>
            <ul className="space-y-2">
              <li><a href="/report/new" className="text-gray-400 hover:text-white text-sm transition">New Report</a></li>
              <li><a href="/reports" className="text-gray-400 hover:text-white text-sm transition">View Reports</a></li>
              <li><a href="/guidelines" className="text-gray-400 hover:text-white text-sm transition">Guidelines</a></li>
              <li><a href="/reports?category=pothole" className="text-gray-400 hover:text-white text-sm transition">Potholes</a></li>
              <li><a href="/reports?category=garbage" className="text-gray-400 hover:text-white text-sm transition">Garbage Issues</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">RESOURCES</h4>
            <ul className="space-y-2">
              <li><a href="/guidelines" className="text-gray-400 hover:text-white text-sm transition">How to Report</a></li>
              <li><a href="/reports" className="text-gray-400 hover:text-white text-sm transition">Track Progress</a></li>
              <li><a href="/admin/login" className="text-gray-400 hover:text-white text-sm transition">Admin Portal</a></li>
              <li><a href="/worker/login" className="text-gray-400 hover:text-white text-sm transition">Worker Portal</a></li>
              <li><a href="/worker/register" className="text-gray-400 hover:text-white text-sm transition">Join as Worker</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">SUPPORT</h4>
            <ul className="space-y-2">
              <li><a href="/guidelines" className="text-gray-400 hover:text-white text-sm transition">Help Center</a></li>
              <li><a href="/reports" className="text-gray-400 hover:text-white text-sm transition">Status</a></li>
              <li><a href="/admin/login" className="text-gray-400 hover:text-white text-sm transition">Contact Admin</a></li>
              <li><a href="/worker/login" className="text-gray-400 hover:text-white text-sm transition">Worker Support</a></li>
              <li><span className="text-gray-400 text-sm">Community Guidelines</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <p className="text-gray-400 text-sm">© 2024 JanFix</p>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">Privacy</a>
              <span className="text-gray-400 text-sm">| ID: Janfix1383</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm font-medium">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
