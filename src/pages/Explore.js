import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";
import { motion } from "framer-motion";
import { 
  FaCar, FaHome, FaMobileAlt, FaCouch, FaTshirt, FaBriefcase, 
  FaTools, FaPaw, FaFootballBall, FaPuzzlePiece, FaBaby, 
  FaBuilding, FaMedkit, FaGraduationCap, FaPlane, FaCalendarAlt, 
  FaTractor, FaEllipsisH 
} from 'react-icons/fa';

const categories = {
  "Vehicles": { icon: FaCar, color: "blue", description: "Cars, motorcycles, and other vehicles" },
  "Property": { icon: FaHome, color: "indigo", description: "Houses, apartments, and land" },
  "Electronics": { icon: FaMobileAlt, color: "purple", description: "Phones, laptops, and gadgets" },
  "Home & Garden": { icon: FaCouch, color: "pink", description: "Furniture, decor, and garden items" },
  "Fashion & Beauty": { icon: FaTshirt, color: "rose", description: "Clothing, accessories, and beauty products" },
  "Jobs": { icon: FaBriefcase, color: "red", description: "Job listings and opportunities" },
  "Services": { icon: FaTools, color: "orange", description: "Professional and personal services" },
  "Pets": { icon: FaPaw, color: "amber", description: "Pets and pet supplies" },
  "Sports & Outdoors": { icon: FaFootballBall, color: "yellow", description: "Sports equipment and outdoor gear" },
  "Hobbies & Leisure": { icon: FaPuzzlePiece, color: "lime", description: "Books, games, and hobby items" },
  "Kids & Baby Products": { icon: FaBaby, color: "green", description: "Children's items and baby gear" },
  "Business & Industrial": { icon: FaBuilding, color: "emerald", description: "Business equipment and supplies" },
  "Health & Wellness": { icon: FaMedkit, color: "teal", description: "Health products and equipment" },
  "Education": { icon: FaGraduationCap, color: "cyan", description: "Educational materials and courses" },
  "Travel & Tourism": { icon: FaPlane, color: "sky", description: "Travel packages and accessories" },
  "Events": { icon: FaCalendarAlt, color: "blue", description: "Event tickets and services" },
  "Agriculture & Farming": { icon: FaTractor, color: "violet", description: "Farming equipment and products" },
  "Others": { icon: FaEllipsisH, color: "gray", description: "Miscellaneous items" }
};

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryAds, setCategoryAds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryAds(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategoryAds = async (category) => {
    setLoading(true);
    try {
      const adsRef = collection(db, "ads");
      const q = query(adsRef, where("category", "==", category));
      const querySnapshot = await getDocs(q);
      const ads = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategoryAds(ads);
    } catch (error) {
      console.error("Error fetching category ads:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen mt-8 bg-gradient-to-r from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Explore Categories
          </h1>
          <p className="text-xl text-gray-600">
            Discover items across all categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categories).map(([name, { icon: Icon, color, description }]) => (
            <motion.div
              key={name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(name)}
              className={`
                p-6 rounded-xl shadow-lg bg-white cursor-pointer
                ${selectedCategory === name ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                  <Icon className={`w-6 h-6 text-${color}-500`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedCategory && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Items in {selectedCategory}
            </h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : categoryAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryAds.map(ad => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">
                No items found in this category
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
