import { signOut } from "firebase/auth";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { auth, db } from "../firebaseConfig";
import { FaUserAlt, FaSearch, FaHeart, FaComments, FaSignOutAlt, FaShoppingCart } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  const { user, unread } = useContext(AuthContext);
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [userName, setUserName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setPhotoUrl(userData.photoUrl || null);
          setUserName(userData.name || user.displayName || "User");
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Simulated search results - replace with actual API call or database query
    const simulatedResults = [
      "iPhone 12",
      "Samsung Galaxy S21",
      "MacBook Pro",
      "Sony PlayStation 5",
      "Nintendo Switch",
    ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
    setSearchResults(simulatedResults);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800 transition-all duration-300">
      <div className="max-w-[95%] mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="https://svgshare.com/i/1BQj.svg"
                className="h-10 w-auto"
                alt="Logo"
              />
              <span className="ml-2 text-2xl font-semibold text-gray-800 dark:text-white">
                ShopNSwap
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/buy">Buy</NavLink>
              <NavLink to="/swap">Swap</NavLink>
              <NavLink to="/donate">Donate</NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  className="w-96 pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 hover:shadow-md"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                >
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </button>
              </form>
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        setSearchQuery(result);
                        setSearchResults([]);
                      }}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/sell"
              className="hidden md:flex px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              <MdPostAdd className="inline-block mr-1" /> Post Ad
            </Link>

            <Link
              to="/cart"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300 ease-in-out transform hover:scale-110"
            >
              <FaShoppingCart className="h-6 w-6" />
            </Link>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={toggleDropdown}
                >
                  {photoUrl ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover border-2 border-blue-500"
                      src={photoUrl}
                      alt={userName}
                    />
                  ) : (
                    <FaUserAlt className="h-10 w-10 rounded-full p-2 bg-gray-200 text-gray-600" />
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                      {userName}
                    </div>
                    <DropdownLink to={`/profile/${user.uid}`} icon={FaUserAlt}>
                      Profile
                    </DropdownLink>
                    <DropdownLink to="/favorites" icon={FaHeart}>
                      My Favorites
                    </DropdownLink>
                    <DropdownLink 
                      to="/chat" 
                      icon={FaComments}
                      className={unread.length ? "bg-red-50 dark:bg-red-900/50" : ""}
                    >
                      Chat
                      {unread.length > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                          {unread.length}
                        </span>
                      )}
                    </DropdownLink>
                    <button
                      onClick={() => {
                        handleSignout();
                        toggleDropdown();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out"
                    >
                      <FaSignOutAlt className="inline-block mr-2" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <AuthButton to="/auth/register">Register</AuthButton>
                <AuthButton to="/auth/login" variant="outline">Login</AuthButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out hover:bg-blue-100 dark:hover:bg-blue-900 relative group"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
  </Link>
);

const DropdownLink = ({ to, icon: Icon, children, className = "" }) => (
  <Link
    to={to}
    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out ${className}`}
  >
    <Icon className="inline-block mr-2" /> {children}
  </Link>
);

const AuthButton = ({ to, children, variant = "default" }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg ${
      variant === "outline"
        ? "text-blue-600 bg-white border border-blue-600 hover:bg-blue-50"
        : "text-white bg-blue-600 hover:bg-blue-700"
    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
  >
    {children}
  </Link>
);

export default Navbar;