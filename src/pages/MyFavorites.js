import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdCard from '../components/AdCard';
import { FiHeart } from 'react-icons/fi';

const MyFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const favoritesRef = collection(db, 'favorites');
        const q = query(favoritesRef, where('users', 'array-contains', user.uid));
        
        // Get initial favorites
        const querySnapshot = await getDocs(q);
        const favoriteIds = querySnapshot.docs.map(doc => doc.id);
        
        if (favoriteIds.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        // Fetch the actual ads for each favorite
        const adsRef = collection(db, 'ads');
        const unsubscribe = onSnapshot(
          query(adsRef, where('__name__', 'in', favoriteIds)),
          (snapshot) => {
            const ads = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setFavorites(ads);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching favorites:", error);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <FiHeart className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </motion.div>
          <p className="text-gray-600">Items you've saved for later</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : favorites.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {favorites.map((ad) => (
                <motion.div
                  key={ad.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdCard ad={ad} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[400px] text-center"
          >
            <FiHeart className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">Start adding items to your favorites by clicking the heart icon on ads you like!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
            >
              Explore Ads
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyFavorites;
