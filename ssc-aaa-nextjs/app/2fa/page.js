"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TwoFASetup() {
  const [code, setCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    const qr = searchParams.get("qr");
    if (emailFromQuery && qr) {
      setEmail(emailFromQuery);
      setQrCodeUrl(decodeURIComponent(qr));
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/success");
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        {/* Make "Scan and Verify" text black */}
        <h1 className="text-2xl font-bold mb-4 text-black">Scan and Verify</h1>

        {qrCodeUrl && (
          <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4" />
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 2FA Code"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" // Ensure the text in input is black
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Verify
          </button>
        </form>

        {message && <p className="text-red-500 mt-2">{message}</p>}
      </div>
    </div>
  );
}
