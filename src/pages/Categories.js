import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AdCard from '../components/AdCard';
import CategoryPageAnimation from '../components/CategoryPageAnimation';

const Categories = () => {
  const [ads, setAds] = useState({ sell: [], swap: [], donate: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const fetchedAds = { sell: [], swap: [], donate: [] };
      const querySnapshot = await getDocs(query(collection(db, 'ads')));

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const ad = {
          ...data,
          id: doc.id,
          timestamp: data.timestamp || data.publishedAt || data.createdAt || new Date(),
        };

        const adType = (ad.adType || '').toLowerCase();
        if (fetchedAds[adType]) {
          fetchedAds[adType].push(ad);
        }
      });

      // Sort each category by timestamp
      Object.keys(fetchedAds).forEach((type) => {
        fetchedAds[type].sort((a, b) => {
          const timeA = a.timestamp instanceof Date ? a.timestamp : a.timestamp?.toDate?.();
          const timeB = b.timestamp instanceof Date ? b.timestamp : b.timestamp?.toDate?.();
          return (timeB?.getTime() || 0) - (timeA?.getTime() || 0);
        });
      });

      setAds(fetchedAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
    setIsLoading(false);
  };

  const getFilteredAds = () => {
    if (activeTab === 'all') {
      return [
        ...ads.sell,
        ...ads.swap,
        ...ads.donate,
      ].sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : a.timestamp?.toDate?.();
        const timeB = b.timestamp instanceof Date ? b.timestamp : b.timestamp?.toDate?.();
        return (timeB?.getTime() || 0) - (timeA?.getTime() || 0);
      });
    }
    return ads[activeTab] || [];
  };

  const tabs = [
    { id: 'all', label: 'All Items', color: 'from-primary-500 to-purple-600' },
    { id: 'sell', label: 'Shop', color: 'from-blue-500 to-cyan-600' },
    { id: 'swap', label: 'Swap', color: 'from-purple-500 to-pink-600' },
    { id: 'donate', label: 'Donate', color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <div className="min-h-screen relative">
      <CategoryPageAnimation />

      {/* Header Section */}
      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              Browse All Categories
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing items across all categories. Whether you're looking to buy, swap, or donate,
            find everything in one place.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-12">
          <div className="flex justify-center space-x-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'bg-white/80 text-gray-600 hover:bg-white shadow-md hover:shadow-lg'
                  }
                `}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {getFilteredAds().map((ad) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <AdCard ad={ad} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && getFilteredAds().length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h3 className="text-2xl font-semibold text-gray-600">No items found</h3>
            <p className="text-gray-500 mt-2">Try selecting a different category or check back later.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Categories;
