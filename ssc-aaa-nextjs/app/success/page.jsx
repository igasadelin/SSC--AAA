// app/success/page.js

export default function SuccessPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-green-100">
      <div className="text-center p-6 bg-white shadow-md rounded-md">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Success!</h1>
        <p className="text-lg">
          You have successfully logged in and completed 2FA verification.
        </p>
      </div>
    </div>
  );
}
