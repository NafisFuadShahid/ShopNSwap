import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaGithub, FaHeart, FaArrowRight } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-white to-gray-50">
      {/* Newsletter Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 md:p-12 overflow-hidden relative"
        >
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
              <rect width="100" height="100" fill="url(#grid)"/>
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Stay in the loop</h2>
              <p className="text-white/80 text-lg">Get the latest updates and offers directly in your inbox.</p>
            </div>
            <div className="flex-1 w-full md:w-auto">
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-6 py-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  Subscribe
                  <FaArrowRight />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Footer */}
      <motion.div 
        variants={footerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white text-2xl font-bold">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">ShopNSwap</span>
                <span className="text-sm text-gray-500">Trade Smarter</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-8">
              Your modern marketplace for seamless local trading. Buy, sell, and swap items within your community.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <FaFacebook />, href: 'https://facebook.com/shopnswap', color: 'hover:bg-blue-500' },
                { icon: <FaTwitter />, href: 'https://twitter.com/shopnswap', color: 'hover:bg-sky-500' },
                { icon: <FaInstagram />, href: 'https://instagram.com/shopnswap', color: 'hover:bg-pink-500' },
                { icon: <FaGithub />, href: 'https://github.com/shopnswap', color: 'hover:bg-gray-900' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:text-white ${social.color} transition-all duration-300`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-gray-900 font-semibold mb-6">Product</h3>
            <ul className="space-y-4">
              {['Features', 'Pricing', 'FAQ', 'Blog'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-primary-600 transition-colors flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-gray-900 font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              {['About', 'Careers', 'Press', 'News'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-primary-600 transition-colors flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-gray-900 font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              {['Help Center', 'Community', 'Partners', 'Status'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-600 hover:text-primary-600 transition-colors flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-gray-900 font-semibold mb-6">Legal</h3>
            <ul className="space-y-4">
              {['Privacy', 'Terms', 'Cookies', 'License'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-primary-600 transition-colors flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <span> {currentYear} ShopNSwap</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">All rights reserved</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-gray-500">Crafted with</span>
              <FaHeart className="text-red-500 animate-pulse" />
              <span className="text-gray-500">in Bangladesh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent" />
        <div className="absolute -bottom-1 left-0 right-0">
          <svg className="w-full h-px" preserveAspectRatio="none" viewBox="0 0 1440 1">
            <line x1="0" y1="0" x2="1440" y2="0" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" className="text-gray-200" />
          </svg>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
