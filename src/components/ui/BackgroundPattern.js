import React from 'react';
import { motion } from 'framer-motion';

const BackgroundPattern = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
        className="absolute w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 0.1 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.1 }} />
          </linearGradient>
          <pattern id="pattern1" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <motion.rect
          width="100%"
          height="100%"
          fill="url(#pattern1)"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </motion.svg>
    </div>
  );
};

export default BackgroundPattern;
