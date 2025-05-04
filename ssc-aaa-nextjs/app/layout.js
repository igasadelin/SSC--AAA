// app/layout.js

import '../styles/globals.css';  // Your custom global styles
import 'tailwindcss/tailwind.css';  // Tailwind's default CSS

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
