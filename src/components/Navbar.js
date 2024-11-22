import { signOut } from "firebase/auth";
import { doc, updateDoc, onSnapshot, collection, getDocs, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { auth, db } from "../firebaseConfig";
import { FaUserAlt, FaSearch, FaHeart, FaComments, FaSignOutAlt, FaMapMarkerAlt, FaCrosshairs } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const libraries = ["places"];

const MapPopup = ({ isOpen, onClose, userLocation, onLocationUpdate }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyAih9-dwM_G_gKQEuNwNPjGyP6tipZ15m8",
    libraries,
  });

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState("");

  const onLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds(userLocation);
    map.fitBounds(bounds);
    setMap(map);
    setMarker(userLocation);
  }, [userLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    await updateMarkerAndCenter({ lat, lng });
  };

  const fetchRegionName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyAih9-dwM_G_gKQEuNwNPjGyP6tipZ15m8`
      );
      const data = await response.json();
      
      if (data.status !== "OK") {
        throw new Error(`Geocoding API error: ${data.status}`);
      }

      const result = data.results[0];
      if (!result) {
        throw new Error("No results found");
      }

      const locality = result.address_components.find(component => 
        component.types.includes("locality")
      );
      const adminArea = result.address_components.find(component => 
        component.types.includes("administrative_area_level_1")
      );

      let locationString = "Unknown location";
      if (locality && adminArea) {
        locationString = `${locality.long_name}, ${adminArea.long_name}`;
      } else if (adminArea) {
        locationString = adminArea.long_name;
      }

      setLocationName(locationString);
      return locationString;
    } catch (error) {
      console.error("Error fetching region name:", error);
      return "Unknown location";
    }
  };

  const updateMarkerAndCenter = async (location) => {
    setIsLoading(true);
    setMarker(location);
    if (map) {
      map.panTo(location);
      map.setZoom(15);
    }
    const locationString = await fetchRegionName(location.lat, location.lng);
    setIsLoading(false);
    return locationString;
  };

  const handleCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          await updateMarkerAndCenter(currentLocation);
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Unable to fetch your location. ";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "User denied the request for Geolocation.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "The request to get user location timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
              break;
          }
          alert(errorMessage);
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (marker) {
      onLocationUpdate(marker.lat, marker.lng, locationName);
      onClose();
    } else {
      alert("Please select a location first.");
    }
  };

  if (!isOpen) return null;

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[80vw] max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Update Your Location</h2>
          {isLoading && (
            <span className="text-sm text-gray-500">Updating location...</span>
          )}
        </div>
        <div className="relative">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '400px' }}
            center={userLocation}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>
          <button
            onClick={handleCurrentLocation}
            className="absolute bottom-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10 flex items-center gap-2"
            title="Use current location"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <FaCrosshairs className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Current Location</span>
              </>
            )}
          </button>
        </div>
        <p className="mt-2">Selected Location: {locationName || "Not selected"}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!marker || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, unread } = useContext(AuthContext);
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [userName, setUserName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 23.8103, lng: 90.4125 }); // Default to Dhaka, Bangladesh
  const [locationName, setLocationName] = useState("");
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
          if (userData.lat && userData.lon) {
            setUserLocation({ lat: parseFloat(userData.lat), lng: parseFloat(userData.lon) });
          }
          setLocationName(userData.locationName || "");
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

  const handleLocationClick = () => {
    if (!user) {
      alert("Please login to use location services");
      return;
    }
    setShowMapPopup(true);
  };

  const handleLocationUpdate = async (lat, lng, locationName) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        lat: lat.toString(),
        lon: lng.toString(),
        locationName: locationName,
      });
      setUserLocation({ lat, lng });
      setLocationName(locationName);
      alert("Location updated successfully!");
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location. Please try again.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults([]);
    }
  };

  const handleSearchChange = async (e) => {
    const queryText = e.target.value;
    setSearchQuery(queryText);

    if (queryText.trim()) {
      const adsRef = collection(db, "ads");
      const q = query(
        adsRef,
        where("title", ">=", queryText.toLowerCase()),
        where("title", "<=", queryText.toLowerCase() + "\uf8ff")
      );

      try {
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSearchResults(results);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800 transition-all duration-300">
      <div className="max-w-[95%] mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <svg
              className="h-10 w-auto text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
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
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        setSearchQuery(result.title);
                        setSearchResults([]);
                        navigate(`/ad/${result.id}`);
                      }}
                    >
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">{result.category}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">BDT{result.price}</div>
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

            <button
              onClick={handleLocationClick}
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300 ease-in-out transform hover:scale-110"
              title="Update Location"
            >
              <FaMapMarkerAlt className="h-6 w-6" />
            </button>
            {locationName && (
              <span className="text-sm text-gray-600 dark:text-gray-300">{locationName}</span>
            )}

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
                    <DropdownLink to={`/profile/${user.uid}`} icon={FaUserAlt} onClick={closeDropdown}>
                      Profile
                    </DropdownLink>
                    <DropdownLink to="/favorites" icon={FaHeart} onClick={closeDropdown}>
                      My Favorites
                    </DropdownLink>
                    <DropdownLink 
                      to="/chat" 
                      icon={FaComments}
                      onClick={closeDropdown}
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
      <MapPopup
        isOpen={showMapPopup}
        onClose={() => setShowMapPopup(false)}
        userLocation={userLocation}
        onLocationUpdate={handleLocationUpdate}
      />
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

const DropdownLink = ({ to, icon: Icon, children, onClick, className }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out ${className}`}
  >
    <Icon className="inline-block mr-2" />
    {children}
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