import { signOut } from "firebase/auth";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { auth, db } from "../firebaseConfig";
import { Dropdown } from "react-bootstrap";
import { FaUserAlt, FaShoppingCart, FaSearch, FaUser, FaHeart, FaSignOutAlt } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setPhotoUrl(userData.photoUrl || null);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleSignout = async () => {
    const confirm = window.confirm("Are you sure you want to log out?");
    if (confirm) {
      await updateDoc(doc(db, "users", user.uid), { isOnline: false });
      await signOut(auth);
      navigate("/auth/login");
    }
  };

  const [hoveredButton, setHoveredButton] = useState(null);

  const handleMouseEnter = (buttonName) => {
    setHoveredButton(buttonName);
  };

  const handleMouseLeave = () => {
    setHoveredButton(null);
  };

  const buttonStyle = (buttonName) => ({
    padding: "10px",
    color: hoveredButton === buttonName ? "#fff" : "#0056b3",
    fontWeight: "bold",
    backgroundColor: hoveredButton === buttonName ? "#007bff" : "#f0f0f0",
    transition: "background-color 0.3s ease, color 0.3s ease",
  });

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand fw-bold text-primary" to="/" style={{ color: "#0056b3", fontSize: "24px" }}>
          ShopNSwap
        </Link>

        {/* Toggler/collapsible Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/sell"
                style={buttonStyle("sell")}
                onMouseEnter={() => handleMouseEnter("sell")}
                onMouseLeave={handleMouseLeave}
              >
                Sell
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/buy"
                style={buttonStyle("buy")}
                onMouseEnter={() => handleMouseEnter("buy")}
                onMouseLeave={handleMouseLeave}
              >
                Buy
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/swap"
                style={buttonStyle("swap")}
                onMouseEnter={() => handleMouseEnter("swap")}
                onMouseLeave={handleMouseLeave}
              >
                Swap
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/donate"
                style={buttonStyle("donate")}
                onMouseEnter={() => handleMouseEnter("donate")}
                onMouseLeave={handleMouseLeave}
              >
                Donate
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            {/* Search bar */}
            <div className="input-group" style={{ marginRight: "80px", width: "450px" }}>
              <input
                type="text"
                placeholder="Search..."
                className="form-control"
                style={{
                  border: "2px solid #007bff",
                  borderRadius: "30px 0 0 30px",
                  padding: "7px 10px",
                  color: "#333",
                }}
              />
              <span
                className="input-group-text"
                style={{
                  backgroundColor: "#007bff",
                  borderColor: "#007bff",
                  color: "white",
                  borderRadius: "0 30px 30px 0",
                  cursor: "pointer",
                }}
              >
                <FaSearch />
              </span>
            </div>

            {/* Cart button */}
            <button className="btn btn-primary" style={{ backgroundColor: "#007bff", borderColor: "#007bff", marginRight: "-15px" }}>
              <FaShoppingCart size={20} />
            </button>

            {/* User dropdown */}
            {user ? (
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic" variant="light" className="d-flex align-items-center border-0 bg-transparent ms-3">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={user.name || "Profile Avatar"}
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                  ) : (
                    <FaUserAlt size={30} className="text-secondary" />
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={`/profile/${user.uid}`}>
                    <FaUser className="me-2" /> Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to={`/favorites`}>
                    <FaHeart className="me-2" /> My Favorites
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleSignout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex">
                <Link className="btn btn-outline-primary me-2" to="/auth/register">
                  Register
                </Link>
                <Link className="btn btn-outline-primary" to="/auth/login">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;