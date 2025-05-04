// app/page.js (or app/home.js depending on your setup)

"use client"; // This ensures that the page is rendered on the client side and allows using hooks

import { useRouter } from "next/navigation"; // Import useRouter hook from next/navigation

export default function HomePage() {
  const router = useRouter(); // Initialize useRouter hook

  const redirectToRegister = () => {
    router.push("/register"); // Redirects to the register page
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Our App</h1>
        <button
          onClick={redirectToRegister}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300"
        >
          Register
        </button>
      </div>
    </div>
  );
}
