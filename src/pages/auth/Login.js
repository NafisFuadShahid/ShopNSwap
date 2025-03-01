import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../../firebaseConfig";
import { signInWithEmailAndPassword, applyActionCode } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function Component() {
  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    loading: false,
    verificationSuccess: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const verificationProcessed = useRef(false);

  const { email, password, error, loading, verificationSuccess } = values;

  // verification process using mode and oobCode
  useEffect(() => {
    // Parse query parameter
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get("mode");
    const oobCode = queryParams.get("oobCode");

    // handle email verification - only process once
    if (mode === "verifyEmail" && oobCode && !verificationProcessed.current) {
      verificationProcessed.current = true; // Mark as processed immediately
      
      (async () => {
        try {
          await applyActionCode(auth, oobCode);
          setValues(prev => ({
            ...prev,
            verificationSuccess: true,
            error: ""
          }));
        } catch (error) {
          // Reset the verification processed flag if there was an error
          // This allows retrying if the error was transient
          verificationProcessed.current = false;
          
          setValues(prev => ({
            ...prev,
            error: "Email verification failed: " + error.message
          }));
        }
      })();
    }
  }, [location]);

  const handleChange = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setValues({ ...values, error: "All fields are required" });
      return;
    }

    setValues({ ...values, error: "", loading: true });

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      if (!result.user.emailVerified) {
        setValues({
          ...values,
          error: "Please verify your email before logging in.",
          loading: false,
        });
        return;
      }

      await updateDoc(doc(db, "users", result.user.uid), {
        isOnline: true,
      });

      setValues({
        email: "",
        password: "",
        error: "",
        loading: false,
      });

      if (location.state?.from) {
        navigate(location.state.from.pathname);
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setValues({ ...values, error: error.message, loading: false });
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border border-purple-100 p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">
          Log Into Your Account
        </h2>

        {verificationSuccess && (
          <div className="mb-4 p-3 text-green-700 bg-green-100 rounded">
            Email verified successfully! You can now log in.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition transform hover:scale-105"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Link
              to="/auth/register"
              className="inline-block w-full py-2 px-4 border border-purple-600 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition"
            >
              Create an Account
            </Link>
          </div>
          <div className="text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}