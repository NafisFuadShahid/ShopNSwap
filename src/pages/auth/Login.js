import React, { useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate, Link, useLocation } from "react-router-dom";
import './Login.css'; // Make sure to create a separate CSS file for styles

const Login = () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    loading: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const { email, password, error, loading } = values;

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
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h3 className="text-center mb-4">Log Into Your Account</h3>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="text-center text-danger">{error}</p>}

        <div className="text-center mb-3">
          <button
            className="login-button"
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </div>

        <div className=" text-center mb-3">
          <Link className="btn btn-outline-primary" to="/auth/register">
            Register
          </Link>
          <small className="mt-10 text-center">
            <Link to="/auth/forgot-password">Forgot Password?</Link>
          </small>
        </div>
      </form>
    </div>
  );
};

export default Login;
