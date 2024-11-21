import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import AdCard from "../components/AdCard";
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt } from "react-icons/fa";
import { 
  FaCar, FaHome, FaMobileAlt, FaCouch, FaTshirt, FaBriefcase, 
  FaTools, FaPaw, FaFootballBall, FaPuzzlePiece, FaBaby, 
  FaBuilding, FaMedkit, FaGraduationCap, FaPlane, FaCalendarAlt, 
  FaTractor, FaEllipsisH 
} from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";

const categories = {
  "Vehicles": FaCar,
  "Property": FaHome,
  "Electronics": FaMobileAlt,
  "Home": FaCouch,
  "Fashion": FaTshirt,
  "Jobs": FaBriefcase,
  "Services": FaTools,
  "Pets": FaPaw,
  "Sports": FaFootballBall,
  "Hobbies": FaPuzzlePiece,
  "Kids": FaBaby,
  "Business": FaBuilding,
  "Health": FaMedkit,
  "Education": FaGraduationCap,
  "Travel": FaPlane,
  "Events": FaCalendarAlt,
  "Agriculture": FaTractor,
  "Others": FaEllipsisH
};

const Home = () => {
  const [ads, setAds] = useState({ sell: [], swap: [], donate: [] });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState("latest");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [isLocationAvailable, setIsLocationAvailable] = useState(true);
  const categoryRef = useRef(null);

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", auth.currentUser.uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        if (userData.lat && userData.lon) {
          setUserLocation({ lat: parseFloat(userData.lat), lon: parseFloat(userData.lon) });
          setIsLocationAvailable(true);
        } else {
          setIsLocationAvailable(false);
          requestUserLocation();
        }
      } else {
        setIsLocationAvailable(false);
        requestUserLocation();
      }
    };

    fetchUserLocation();
  }, []);

  const requestUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setIsLocationAvailable(true);
          // Here you would typically update the user's location in Firebase
        },
        () => {
          setShowToast(true);
          setIsLocationAvailable(false);
          setTimeout(() => setShowToast(false), 5000);
        }
      );
    } else {
      setShowToast(true);
      setIsLocationAvailable(false);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const getAds = async (category = null, sortOption = "latest") => {
    const adsRef = collection(db, "ads");
    let q = category ? query(adsRef, where("category", "==", category)) : query(adsRef);

    const adDocs = await getDocs(q);
    let fetchedAds = { sell: [], swap: [], donate: [] };
    adDocs.forEach((doc) => {
      const ad = { ...doc.data(), id: doc.id };
      if (fetchedAds[ad.adType]) {
        fetchedAds[ad.adType].push(ad);
      }
    });

    // Sort ads for each type
    Object.keys(fetchedAds).forEach(type => {
      if (sortOption === "low") {
        fetchedAds[type].sort((a, b) => a.price - b.price);
      } else if (sortOption === "high") {
        fetchedAds[type].sort((a, b) => b.price - a.price);
      } else if (sortOption === "latest") {
        fetchedAds[type].sort((a, b) => b.publishedAt - a.publishedAt);
      } else if (sortOption === "area") {
        if (isLocationAvailable && userLocation) {
          fetchedAds[type] = fetchedAds[type].filter(ad => {
            if (!ad.lat || !ad.lon) return false;
            const distance = calculateDistance(userLocation.lat, userLocation.lon, parseFloat(ad.lat), parseFloat(ad.lon));
            return distance <= 20; // 20km radius
          }).sort((a, b) => {
            if (!a.lat || !a.lon || !b.lat || !b.lon) return 0;
            const distanceA = calculateDistance(userLocation.lat, userLocation.lon, parseFloat(a.lat), parseFloat(a.lon));
            const distanceB = calculateDistance(userLocation.lat, userLocation.lon, parseFloat(b.lat), parseFloat(b.lon));
            return distanceA - distanceB;
          });
        } else {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
          setSortOption("latest");
          fetchedAds[type].sort((a, b) => b.publishedAt - a.publishedAt);
        }
      }
    });

    setAds(fetchedAds);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  useEffect(() => {
    getAds(selectedCategory, sortOption);
  }, [selectedCategory, sortOption, userLocation, isLocationAvailable]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const scrollRight = () => {
    categoryRef.current.scrollBy({ left: 200, behavior: "smooth" });
    updateArrowVisibility();
  };

  const scrollLeft = () => {
    categoryRef.current.scrollBy({ left: -200, behavior: "smooth" });
    updateArrowVisibility();
  };

  const updateArrowVisibility = () => {
    const { scrollLeft, scrollWidth, clientWidth } = categoryRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <style jsx>{`
        .category-container {
          display: flex;
          align-items: center;
          overflow-x: hidden;
          gap: 20px;
          padding-bottom: 20px;
          position: relative;
        }
        .category-card {
          display: flex;
          align-items: center;
          background-color: #ffffff;
          border-radius: 50px;
          padding: 15px 25px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .category-card:hover {
          background-color: #f0f9ff;
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .category-image-container {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: #f3f4f6;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .category-image {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }
        .category-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        .selected-category {
          background-color: #3b82f6;
        }
        .selected-category .category-label {
          color: white;
        }
        .selected-category .category-image-container {
          background-color: rgba(255, 255, 255, 0.2);
        }
        .selected-category svg {
          color: white;
        }
        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: #ffffff;
          color: #3b82f6;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .arrow:hover {
          background-color: #3b82f6;
          color: white;
        }
        .arrow-left {
          left: -20px;
        }
        .arrow-right {
          right: -20px;
        }
        .dropdown-custom {
          appearance: none;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 0.5rem 2.5rem 0.5rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: #374151;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }
        .ad-type-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .ad-type-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          text-transform: capitalize;
        }
        .category-image-container svg {
          transition: transform 0.3s ease;
        }
        .category-card:hover .category-image-container svg {
          transform: scale(1.2);
        }
        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #4b5563;
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 50;
        }
      `}</style>

      <h2 className="text-3xl font-bold mb-6 text-gray-800">Categories</h2>

      <div className="relative">
        {showLeftArrow && (
          <button className="arrow arrow-left" onClick={scrollLeft}>
            <FaChevronLeft size={18} />
          </button>
        )}
        <div
          className="category-container"
          ref={categoryRef}
          onScroll={updateArrowVisibility}
        >
          {Object.entries(categories).map(([category, Icon]) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className="focus:outline-none"
            >
              <div
                className={`category-card ${
                  selectedCategory === category ? "selected-category" : ""
                }`}
              >
                <div className="category-image-container">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="category-label">{category}</span>
              </div>
            </button>
          ))}
        </div>
        {showRightArrow && (
          <button className="arrow arrow-right" onClick={scrollRight}>
            <FaChevronRight size={18} />
          </button>
        )}
      </div>

      <div className="mt-8 mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">
          {selectedCategory ? `${selectedCategory} Listings` : "Recent Listings"}
        </h2>
        <div>
          <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By:
          </label>
          <select
            id="sort-select"
            className="dropdown-custom"
            onChange={(e) => setSortOption(e.target.value)}
            value={sortOption}
          >
            <option value="latest">Latest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="area">Nearest to You</option>
          </select>
        </div>
      </div>

      {Object.entries(ads).map(([adType, adList]) => (
        <div key={adType} className="ad-type-section">
          <h3 className="ad-type-title">{adType}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {adList.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="toast"
          >
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              <span>Please allow location access to use the "Nearest to You" feature</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;