import React from 'react';
import { motion } from 'framer-motion';

const AdPageAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 opacity-80" />

      {/* Animated shapes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        {/* Large gradient circle */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-r from-primary-300/20 to-purple-300/20 blur-3xl" />
        </motion.div>

        {/* Small floating elements */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 45, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            className="absolute"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              width: `${30 + i * 10}px`,
              height: `${30 + i * 10}px`,
            }}
          >
            <div className={`
              w-full h-full rounded-lg
              ${i % 2 === 0 
                ? 'bg-gradient-to-br from-primary-400/20 to-purple-400/20'
                : 'bg-gradient-to-br from-purple-400/20 to-primary-400/20'
              }
              blur-xl
            `} />
          </motion.div>
        ))}

        {/* Decorative SVG elements */}
        <svg className="absolute top-1/4 left-1/4 w-64 h-64 text-primary-200/20" viewBox="0 0 200 200">
          <motion.path
            d="M 100 100 L 150 50 L 200 100 L 150 150 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>

        <svg className="absolute bottom-1/4 right-1/4 w-48 h-48 text-purple-200/20" viewBox="0 0 200 200">
          <motion.circle
            cx="100"
            cy="100"
            r="50"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
    </div>
  );
};

export default AdPageAnimation;
