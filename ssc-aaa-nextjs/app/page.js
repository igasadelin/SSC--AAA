"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const redirectToRegister = () => {
    router.push("/register");
  };

  const redirectToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6 text-black">Welcome to MFA</h1>
        <div className="flex justify-center gap-4">
          <button
            onClick={redirectToRegister}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Register
          </button>

          <button
            onClick={redirectToLogin}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
