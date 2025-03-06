import React, { useState } from "react";
import { auth } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-md w-full">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
          Forgot Password
        </h2>
        {success ? (
          <p className="text-center text-green-600">
            An email has been sent with password reset instructions.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            {error && (
              <p className="text-center text-red-600 text-sm">{error}</p>
            )}
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
