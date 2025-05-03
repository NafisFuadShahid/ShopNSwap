// src/components/Navbar.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  getDocs,     
  limit,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { AuthContext } from "../context/auth";
import {
  FaUserAlt,
  FaSearch,
  FaHeart,
  FaComments,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaBell,
} from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import "bootstrap/dist/css/bootstrap.min.css";

const libraries = ["places"];

function MapPopup({ isOpen, onClose, userLocation, onLocationUpdate }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [marker, setMarker] = useState(userLocation);
  const [locName, setLocName] = useState("");

  useEffect(() => {
    setMarker(userLocation);
    setLocName("");
  }, [userLocation, isOpen]);

  if (!isOpen) return null;
  if (loadError) return <div className="p-4">Error loading map</div>;
  if (!isLoaded) return <div className="p-4">Loading map…</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-11/12 max-w-lg h-3/4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2">Update Location</h2>
        <div className="flex-1">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={marker}
            zoom={12}
            onClick={(e) =>
              setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            }
          >
            <Marker
              position={marker}
              draggable
              onDragEnd={(e) =>
                setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() })
              }
            />
          </GoogleMap>
        </div>
        <input
          type="text"
          value={locName}
          onChange={(e) => setLocName(e.target.value)}
          placeholder="Location name"
          className="mt-2 p-2 border rounded w-full dark:bg-gray-700 dark:text-white"
        />
        <div className="mt-2 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onLocationUpdate(marker.lat, marker.lng, locName);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white px-4 py-2 rounded-md text-sm font-medium relative group"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
  </Link>
);

export default function Navbar() {
  const { user, unread } = useContext(AuthContext);
  const navigate = useNavigate();

  const [photoUrl, setPhotoUrl] = useState(null);
  const [userName, setUserName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 23.8103, lng: 90.4125 });
  const [locationName, setLocationName] = useState("");
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // fetch user profile
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setPhotoUrl(d.photoUrl || null);
        setUserName(d.name || user.displayName || "User");
        if (d.lat && d.lon) setUserLocation({ lat: +d.lat, lng: +d.lon });
        setLocationName(d.locationName || "");
      }
    });
    return unsub;
  }, [user]);

  // subscribe to notifications
  useEffect(() => {
    if (!user) return;
    const notifCol = collection(db, "users", user.uid, "notification");
    const q = query(notifCol, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((n) => !n.isRead);
      setNotifications(notifs);
    });
    return unsub;
  }, [user]);

  // close menus/search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchResults([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    await updateDoc(doc(db, "users", user.uid), { isOnline: false });
    await signOut(auth);
    navigate("/auth/login");
  };

  const handleNotificationClick = async (notif) => {
    // mark read in Firestore
    await updateDoc(doc(db, "users", user.uid, "notification", notif.id), {
      isRead: true,
    });
    // remove locally for instant badge update
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    setNotifOpen(false);
    navigate(notif.link);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchResults([]);
  };

  const handleSearchChange = async (e) => {
    const qText = e.target.value;
    setSearchQuery(qText);
    if (!qText.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const adsRef = collection(db, "ads");
      const snap = await getDocs(query(adsRef, limit(5)));
      setSearchResults(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((ad) =>
            [ad.title, ad.category]
              .some((f) => f?.toLowerCase().includes(qText.toLowerCase()))
          )
      );
    } catch {
      setSearchResults([]);
    }
  };

  const handleLocationClick = () => {
    if (!user) {
      alert("Please login to use location services");
      return;
    }
    setShowMapPopup(true);
  };

  const handleLocationUpdate = async (lat, lng, name) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        lat: lat.toString(),
        lon: lng.toString(),
        locationName: name,
      });
      setUserLocation({ lat, lng });
      setLocationName(name);
      alert("Location updated successfully!");
    } catch {
      alert("Failed to update location.");
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Left side */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
                ShopNSwap
              </span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <NavLink to="/buy">Buy</NavLink>
              <NavLink to="/swap">Swap</NavLink>
              <NavLink to="/donate">Donate</NavLink>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="pl-8 pr-4 py-1 rounded-full border focus:outline-none"
                />
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </form>
              {searchResults.length > 0 && (
                <div className="absolute mt-1 w-full bg-white dark:bg-gray-700 rounded shadow-lg z-20">
                  {searchResults.map((r) => (
                    <div
                      key={r.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        navigate(`/ad/${r.id}`);
                        setSearchResults([]);
                      }}
                    >
                      <div className="font-medium">{r.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {r.category}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Ad */}
            <Link
              to="/sell"
              className="hidden md:flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <MdPostAdd className="mr-1" /> Post Ad
            </Link>

            {/* Location */}
            <button
              onClick={handleLocationClick}
              className="text-gray-600 hover:text-blue-600"
              title="Update Location"
            >
              <FaMapMarkerAlt className="h-5 w-5" />
            </button>
            {locationName && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {locationName}
              </span>
            )}

            {/* Notifications */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="text-gray-600 hover:text-blue-600"
                  title="Notifications"
                >
                  <FaBell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded shadow-lg z-30">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                        >
                          {n.message}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Chat */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="text-gray-600 hover:text-blue-600"
                title="Chat"
              >
                <FaUserAlt className="h-5 w-5" />
                {unread.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                    {unread.length}
                  </span>
                )}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded shadow-lg z-30">
                  <div className="px-4 py-2 border-b text-sm">{userName}</div>
                  <Link
                    to={`/profile/${user.uid}`}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                  >
                    <FaUserAlt className="mr-2" /> Profile
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                  >
                    <FaHeart className="mr-2" /> My Favorites
                  </Link>
                  <Link
                    to="/chat"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                  >
                    <FaComments className="mr-2" /> Chat
                  </Link>
                  <button
                    onClick={() => {
                      handleSignout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                  >
                    <FaSignOutAlt className="mr-2" /> Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {!user && (
              <div className="flex space-x-2">
                <Link
                  to="/auth/register"
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Register
                </Link>
                <Link
                  to="/auth/login"
                  className="px-3 py-1 border border-blue-600 text-blue-600 rounded"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <MapPopup
        isOpen={showMapPopup}
        onClose={() => setShowMapPopup(false)}
        userLocation={userLocation}
        onLocationUpdate={handleLocationUpdate}
      />
    </nav>
  );
}
