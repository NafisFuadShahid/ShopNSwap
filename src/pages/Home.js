import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import AdCard from "../components/AdCard";
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { 
  FaCar, FaHome, FaMobileAlt, FaCouch, FaTshirt, FaBriefcase, 
  FaTools, FaPaw, FaFootballBall, FaPuzzlePiece, FaBaby, 
  FaBuilding, FaMedkit, FaGraduationCap, FaPlane, FaCalendarAlt, 
  FaTractor, FaEllipsisH, FaExchangeAlt, FaHandHoldingHeart, FaShoppingBag 
} from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import BackgroundAnimation from '../components/BackgroundAnimation';

const categories = {
  "Vehicles": { icon: FaCar, color: "blue" },
  "Property": { icon: FaHome, color: "indigo" },
  "Electronics": { icon: FaMobileAlt, color: "purple" },
  "Home": { icon: FaCouch, color: "pink" },
  "Fashion": { icon: FaTshirt, color: "rose" },
  "Jobs": { icon: FaBriefcase, color: "red" },
  "Services": { icon: FaTools, color: "orange" },
  "Pets": { icon: FaPaw, color: "amber" },
  "Sports": { icon: FaFootballBall, color: "yellow" },
  "Hobbies": { icon: FaPuzzlePiece, color: "lime" },
  "Kids": { icon: FaBaby, color: "green" },
  "Business": { icon: FaBuilding, color: "emerald" },
  "Health": { icon: FaMedkit, color: "teal" },
  "Education": { icon: FaGraduationCap, color: "cyan" },
  "Travel": { icon: FaPlane, color: "sky" },
  "Events": { icon: FaCalendarAlt, color: "blue" },
  "Agriculture": { icon: FaTractor, color: "violet" },
  "Others": { icon: FaEllipsisH, color: "gray" }
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
  const [isLoading, setIsLoading] = useState(true);
  const categoryRef = useRef(null);

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", auth.currentUser.uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        if (userData.lat && userData.lon) {
          setUserLocation({
            latitude: parseFloat(userData.lat),
            longitude: parseFloat(userData.lon),
            address: userData.address || null
          });
          setIsLocationAvailable(true);
        } else {
          setIsLocationAvailable(false);
          requestUserLocation();
        }
      }
    };

    fetchUserLocation();
    fetchAds();
  }, []);

  const requestUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Get address using OpenStreetMap Nominatim API
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.display_name;

            setUserLocation({
              latitude,
              longitude,
              address
            });
            setIsLocationAvailable(true);
          } catch (error) {
            console.error("Error fetching address:", error);
            setUserLocation({
              latitude,
              longitude,
              address: null
            });
            setIsLocationAvailable(true);
          }
        },
        () => {
          setShowToast(true);
          setIsLocationAvailable(false);
          setTimeout(() => setShowToast(false), 5000);
        }
      );
    }
  };

  useEffect(() => {
    fetchAds();
  }, [selectedCategory]);

  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const fetchedAds = { sell: [], swap: [], donate: [] };

      // Create the base query
      let adsQuery = query(collection(db, "ads"));

      // Add category filter if a category is selected
      if (selectedCategory) {
        adsQuery = query(
          collection(db, "ads"),
          where("category", "==", selectedCategory)
        );
      }

      const querySnapshot = await getDocs(adsQuery);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const ad = {
          ...data,
          id: doc.id,
          timestamp: data.timestamp || data.publishedAt || data.createdAt || new Date()
        };
        
        // Ensure adType is lowercase to match our categories
        const adType = (ad.adType || '').toLowerCase();
        if (fetchedAds[adType]) {
          fetchedAds[adType].push(ad);
        }
      });

      // Sort each category by timestamp
      Object.keys(fetchedAds).forEach(type => {
        fetchedAds[type].sort((a, b) => {
          const timeA = a.timestamp instanceof Date ? a.timestamp : a.timestamp?.toDate?.();
          const timeB = b.timestamp instanceof Date ? b.timestamp : b.timestamp?.toDate?.();
          return (timeB?.getTime() || 0) - (timeA?.getTime() || 0);
        });
      });

      setAds(fetchedAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
    setIsLoading(false);
  };

  const handleScroll = () => {
    if (categoryRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (categoryRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      categoryRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundAnimation />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                Buy, Sell, and Swap
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                with Ease
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Your trusted marketplace for local deals and exchanges. Find amazing deals or list your items today!
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative flex items-center"
              >
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full px-6 py-4 rounded-l-2xl bg-transparent relative z-10 border-0 focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                />
                <button className="px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-r-2xl relative z-10 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
                  <FaSearch className="w-5 h-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16"
          >
            {[
              {
                icon: FaShoppingBag,
                title: "Buy & Sell",
                description: "Find great deals or sell your items",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: FaExchangeAlt,
                title: "Swap Items",
                description: "Exchange items with others",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: FaHandHoldingHeart,
                title: "Donate",
                description: "Give back to the community",
                color: "from-orange-500 to-yellow-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 transform transition-transform group-hover:scale-105" />
                <div className="relative p-8">
                  <div className={`
                    w-14 h-14 rounded-lg flex items-center justify-center
                   bg-gradient-to-r from-blue-500 to-cyan-500
                  `}>
                    <feature.icon className={`w-7 h-7 text-white`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
                
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl"
                  initial={false}
                  animate={selectedCategory === feature.title ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="relative bg-white/50 backdrop-blur-lg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <h2 className="text-3xl font-bold text-center mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                Browse Categories
              </span>
            </h2>
            
            <div className="relative">
              {showLeftArrow && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => scroll("left")}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:bg-white transition-all"
                >
                  <FaChevronLeft className="w-5 h-5 text-gray-600" />
                </motion.button>
              )}
              
              <div
                ref={categoryRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 px-2 relative scroll-smooth"
              >
                {Object.entries(categories).map(([name, { icon: Icon, color }]) => (
                  <motion.button
                    key={name}
                    onClick={() => setSelectedCategory(name)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group flex-shrink-0"
                  >
                    <div className={`
                      relative px-3 py-2 rounded-xl font-medium text-sm
                      transition-all duration-200 flex items-center gap-3
                      ${selectedCategory === name
                        ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/80 text-gray-600 hover:bg-white shadow-md hover:shadow-lg'
                      }
                    `}>
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${selectedCategory === name
                          ? 'bg-white/20'
                          : 'bg-gradient-to-br from-primary-500/10 to-purple-600/10'
                        }
                      `}>
                        <Icon className={`w-5 h-5 ${selectedCategory === name ? 'text-white' : 'text-primary-500'}`} />
                      </div>
                      <span className="font-medium">{name}</span>
                    </div>
                    
                    {/* Hover effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl"
                      initial={false}
                      animate={selectedCategory === name ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                ))}
              </div>

              {showRightArrow && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => scroll("right")}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:bg-white transition-all"
                >
                  <FaChevronRight className="w-5 h-5 text-gray-600" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {Object.entries(ads).map(([type, items]) => items.length > 0 && (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-6 capitalize">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                  {type} Items
                </span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((ad) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdCard ad={ad} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Location Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg"
          >
            Please enable location services for better results
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
