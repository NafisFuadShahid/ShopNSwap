import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiHeart, FiPlusCircle, FiBell, FiMenu, FiX } from 'react-icons/fi';
import { BiBell } from 'react-icons/bi';
import { AuthContext } from '../context/auth';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState({ unread: 0 });
  const [unreadChats, setUnreadChats] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch notifications
    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(notificationsRef, where('userId', '==', user.uid));
    
    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const unreadCount = snapshot.docs.filter(doc => !doc.data().read).length;
      setNotifications({ unread: unreadCount });
    });

    // Fetch unread chat messages
    const messagesRef = collection(db, 'messages');
    const chatQuery = query(
      messagesRef,
      where('users', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );
    
    const unsubChats = onSnapshot(chatQuery, (snapshot) => {
      const unreadCount = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.lastMessage && !data.readBy?.[user.uid];
      }).length;
      setUnreadChats(unreadCount);
    });

    // Fetch favorites
    const favoritesRef = collection(db, 'favorites');
    const favoritesQuery = query(favoritesRef, where('userId', '==', user.uid));
    
    const unsubFavorites = onSnapshot(favoritesQuery, (snapshot) => {
      setFavorites(snapshot.docs.map(doc => doc.data()));
    });

    return () => {
      unsubNotifications();
      unsubChats();
      unsubFavorites();
    };
  }, [user]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/auth/login');
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <motion.nav
        initial={false}
        animate={isScrolled ? { height: '64px' } : { height: '80px' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent hidden sm:inline-block">
                ShopNSwap
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-2 text-gray-600 hover:text-primary-600 transition-colors ${
                    location.pathname === item.path ? 'text-primary-600' : ''
                  }`}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <FiSearch className="w-5 h-5" />
              </motion.button>

              {user && (
                <>
                  {/* Chat */}
                  <motion.div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/chat')}
                      className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <BiBell className="w-5 h-5" />
                      {unreadChats > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadChats}
                        </span>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Notifications */}
                  {/* <motion.div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <FiBell className="w-5 h-5" />
                      {notifications?.unread > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </motion.button>
                  </motion.div> */}

                  {/* Favorites */}
                  <motion.div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/favorites')}
                      className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <FiHeart className="w-5 h-5" />
                      {favorites?.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full text-white text-xs flex items-center justify-center">
                          {favorites.length}
                        </span>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Post Ad Button */}
                  <Link to="/sell">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                    >
                      <FiPlusCircle className="w-5 h-5" />
                      <span>Post Ad</span>
                    </motion.button>
                  </Link>
                </>
              )}

              {/* Profile Menu */}
              <div className="relative">
                {user ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <FiUser className="w-5 h-5" />
                    </motion.button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100"
                        >
                          <Link to="/profile" className="block px-4 py-2 text-gray-600 hover:bg-gray-50">Profile</Link>
                          <Link to="/settings" className="block px-4 py-2 text-gray-600 hover:bg-gray-50">Settings</Link>
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link to="/auth/login">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Log in
                      </motion.button>
                    </Link>
                    <Link to="/auth/register">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                      >
                        Sign up
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-40 bg-white md:hidden pt-20"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              {navItems.map((item) => (
                <motion.div key={item.path} variants={itemVariants}>
                  <Link
                    to={item.path}
                    className={`block py-4 text-lg ${
                      location.pathname === item.path ? 'text-primary-600' : 'text-gray-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              {user && (
                <motion.div variants={itemVariants} className="mt-6">
                  <Link
                    to="/sell"
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiPlusCircle className="w-5 h-5" />
                    <span>Post Ad</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;