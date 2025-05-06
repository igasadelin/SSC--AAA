// app/layout.js

import "../styles/globals.css"; // Your custom global styles
import "tailwindcss/tailwind.css"; // Tailwind's default CSS
import Link from "next/link";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Navigation Bar */}
        <nav className="bg-blue-600 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo (MFA) - Link to Home, positioned on the far left */}
            <Link href="/">
              <h1 className="text-white text-xl font-bold cursor-pointer">
                MFA
              </h1>
            </Link>

            {/* Buttons aligned to the right */}
            <div className="space-x-4 flex">
              <Link href="/register">
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100">
                  Register
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100">
                  Login
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
