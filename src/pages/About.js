import React from 'react';
import { motion } from 'framer-motion';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { FaExchangeAlt, FaHandHoldingHeart, FaShoppingBag, FaUserFriends } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: FaShoppingBag,
      title: "Buy & Sell",
      description: "List your items for sale or find great deals on products you need",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FaExchangeAlt,
      title: "Swap Items",
      description: "Exchange your items with others in the community",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: FaHandHoldingHeart,
      title: "Donate",
      description: "Give back to the community by donating items to those in need",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: FaUserFriends,
      title: "Community",
      description: "Connect with like-minded people in your local area",
      color: "from-green-500 to-teal-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8 mt-8">
      <BackgroundAnimation />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              Welcome to ShopNSwap
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your one-stop platform for buying, selling, swapping, and donating items in your community.
            Join us in creating a sustainable and connected marketplace.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 transform transition-transform group-hover:scale-105" />
              <div className="relative p-8">
                <div className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-r ${feature.color}`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 md:p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              Join Our Community Today
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Start your journey with ShopNSwap and be part of a growing community that believes in sustainable commerce and meaningful connections.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-full font-medium text-white bg-gradient-to-r from-primary-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* Animated shapes */}
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-gradient-to-br from-primary-500/30 to-purple-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-orange-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>
    </div>
  );
};

export default About;
