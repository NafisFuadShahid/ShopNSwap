import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const CategorySlider = ({ categories, selectedCategory, onSelect, categoryRef, handleScroll, showLeftArrow, showRightArrow, scroll }) => {
  return (
    <div className="relative py-8">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/50 to-transparent backdrop-blur-sm -z-10" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
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
                onClick={() => onSelect(name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group flex-shrink-0"
              >
                <div className={`
                  relative px-2 py-2 rounded-xl font-medium text-sm
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
  );
};

export default CategorySlider;
