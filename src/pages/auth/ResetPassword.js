import React, { useState } from "react";
import { auth } from "../../firebaseConfig";
import { confirmPasswordReset } from "firebase/auth";
import { useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  let [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password must match");
      return;
    }

    setError("");
    setSuccess(false);

    try {
      await confirmPasswordReset(auth, searchParams.get("oobCode"), password);
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-md w-full">
        <h3 className="text-center text-2xl font-bold text-gray-800 mb-6">
          Reset Password
        </h3>
        {success ? (
          <p className="text-center text-green-600">
            Your password is successfully reset. You may log in now.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-center text-red-600">{error}</p>}
            <div className="text-center">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
