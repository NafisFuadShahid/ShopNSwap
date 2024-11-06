import { signOut } from "firebase/auth";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { auth, db } from "../firebaseConfig";
import { FaUserAlt, FaSearch } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  const { user, unread } = useContext(AuthContext);
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for dropdown

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

  useEffect(() => {
    // Close dropdown if click is outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignout = async () => {
    const confirm = window.confirm("Are you sure you want to log out?");
    if (confirm) {
      await updateDoc(doc(db, "users", user.uid), {
        isOnline: false,
      });
      await signOut(auth);
      navigate("/auth/login");
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between p-4 mx-14">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="https://svgshare.com/i/1BQj.svg"
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
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex text-sm ml-10 w-12 h-12 rounded-full focus:ring-4 transform transition duration-300 ease-in-out hover:scale-105 hover:ring-2 hover:ring-blue-500"
                aria-expanded="false"
                onClick={toggleDropdown}
              >
                {photoUrl ? (
                  <img
                    className="w-12 h-12 rounded-full transition duration-300 ease-in-out hover:scale-105 hover:ring-2 hover:ring-blue-500"
                    src={photoUrl}
                    alt={user.name || "Profile Avatar"}
                  />
                ) : (
                  <img
                    src="https://i.ibb.co/com/JccxFFM/aa.png"
                    className="w-10 h-10 rounded-full transition duration-300 ease-in-out hover:scale-105 hover:ring-2 hover:ring-blue-500"
                    alt="Logo"
                  />
                )}
              </button>

              <div
                className={`absolute right-0 z-50 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 ${
                  dropdownOpen ? "" : "hidden"
                }`}
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
                      onClick={toggleDropdown}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      onClick={toggleDropdown}
                    >
                      My Favorites
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/chat"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white position-relative"
                      onClick={toggleDropdown}
                    >
                      Chat
                      {unread.length ? (
                        <span className="position-absolute top-10 start-90 translate-middle p-1 bg-danger border border-light rounded-circle">
                          <span className="visually-hidden">New alerts</span>
                        </span>
                      ) : null}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleSignout();
                        toggleDropdown();
                      }}
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
