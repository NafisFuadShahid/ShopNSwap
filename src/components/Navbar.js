import { signOut } from "firebase/auth";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { auth, db } from "../firebaseConfig";
<<<<<<< HEAD
import { FaUserAlt, FaSearch } from "react-icons/fa";
=======
import { Dropdown } from "react-bootstrap";
import { FaUserAlt, FaShoppingCart, FaSearch, FaUser, FaHeart, FaSignOutAlt } from "react-icons/fa";
>>>>>>> ee9c4bb5745120291516cc894fbf78d5569adcc7
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to track dropdown visibility

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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen); // Toggle dropdown visibility
  };

  return (
<<<<<<< HEAD
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src='https://svgshare.com/i/1BQj.svg'
            className="h-8"
            alt="Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            ShopNSwap
          </span>
        </Link>

        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {/* Search bar */}
          <div className="hidden md:flex">
            <input
              type="text"
              className="form-control rounded-full"
              placeholder="Search..."
              style={{ width: "300px" }}
            />
          </div>

          {/* User dropdown */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                className="flex text-sm ml-10 rounded-full focus:ring-4 "
                aria-expanded="false"
                onClick={toggleDropdown} // Toggle dropdown on click
              >
                {photoUrl ? (
                  <img
                    className="w-8 h-8 rounded-full"
                    src={photoUrl}
                    alt={user.name || "Profile Avatar"}
                  />
                ) : (
                  <img
            src="https://i.ibb.co.com/JccxFFM/aa.png"
            className="h-12"
            alt="Logo"
          />
                )}
              </button>

              <div
                className={`absolute right-0 z-50 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 ${
                  dropdownOpen ? "" : "hidden"
                }`} // Show or hide dropdown based on state
              >
                <div className="px-4 py-3">
                  <span className="block text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </span>
                </div>
                <ul className="py-2">
                  <li>
                    <Link
                      to={`/profile/${user.uid}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      My Favorites
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
  <Link
    className="ml-4 w-full inline-block text-center text-white bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-indigo-500 hover:to-purple-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm px-6 py-3 transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl"
    to="/auth/register"
  >
    Register
  </Link>
  <Link
    className="ml-4 w-full inline-block text-center text-white bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-indigo-500 hover:to-purple-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm px-6 py-3 transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl"
    to="/auth/login"
  >
    Login
  </Link>
</div>

          )}
=======
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
>>>>>>> ee9c4bb5745120291516cc894fbf78d5569adcc7
        </div>

        {/* Navbar links for larger screens */}
        <div className="hidden md:flex space-x-8">
          <Link className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500" to="/sell">
            Sell
          </Link>
          <Link className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500" to="/buy">
            Buy
          </Link>
          <Link className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500" to="/swap">
            Swap
          </Link>
          <Link className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500" to="/donate">
            Donate
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
