import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const MinimalGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const MainImage = ({ className = '' }) => (
    <motion.div
      className={`relative group ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.img
        key={currentIndex}
        src={images[currentIndex].url}
        alt="Product"
        className={`w-full ${fullscreen ? 'h-screen object-contain' : 'aspect-[4/3] object-cover'} rounded-lg`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={() => !fullscreen && setFullscreen(true)}
      />
      
      {/* Navigation Buttons */}
      <div className={`absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity ${fullscreen ? 'bg-black/20' : ''}`}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg"
          onClick={(e) => { e.stopPropagation(); prevImage(); }}
        >
          <HiOutlineChevronLeft className="w-6 h-6" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg"
          onClick={(e) => { e.stopPropagation(); nextImage(); }}
        >
          <HiOutlineChevronRight className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, idx) => (
          <motion.div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
            initial={false}
            animate={{
              scale: idx === currentIndex ? 1.2 : 1,
              opacity: idx === currentIndex ? 1 : 0.5,
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  return (
    <>
      <MainImage className="cursor-zoom-in" />
      
      {/* Fullscreen View */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <motion.button
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              onClick={() => setFullscreen(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IoClose className="w-6 h-6 text-white" />
            </motion.button>
            <MainImage />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thumbnails */}
      <div className="mt-4 grid grid-cols-6 gap-2">
        {images.map((image, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative rounded-md overflow-hidden aspect-square ${
              idx === currentIndex ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setCurrentIndex(idx)}
          >
            <img
              src={image.url}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {idx === currentIndex && (
              <motion.div
                layoutId="selectedThumbnail"
                className="absolute inset-0 bg-white/20"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </>
  );
};

export default MinimalGallery;
