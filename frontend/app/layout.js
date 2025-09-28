// app/layout.js
export const metadata = {
  title: 'Janfix',
  description: 'Minimal frontend for testing Janfix backend',
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children} {/* Remove the max-w-xl container */}
      </body>
    </html>
  );
}