import React, { useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, Timestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function Component() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    error: "",
    loading: false,
  });

  const navigate = useNavigate();

  const { name, email, password, confirmPassword, error, loading } = values;

  const handleChange = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setValues({ ...values, error: "All fields are required" });
      return;
    }
    if (password !== confirmPassword) {
      setValues({ ...values, error: "Passwords must match" });
      return;
    }

    setValues({ ...values, error: "", loading: true });

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        createdAt: Timestamp.fromDate(new Date()),
        isOnline: true,
      });

      setValues({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        error: "",
        loading: false,
      });

      navigate("/", { replace: true });
    } catch (error) {
      setValues({ ...values, error: error.message, loading: false });
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border border-purple-100 p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">
          Create An Account
        </h2>
        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition transform hover:scale-105"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-purple-600 hover:text-purple-800 hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}