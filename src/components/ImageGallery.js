import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineLeft, AiOutlineRight, AiOutlineExpand } from 'react-icons/ai';
import { IoMdClose } from 'react-icons/io';

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const ImageControls = () => (
    <>
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        <AiOutlineLeft className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        <AiOutlineRight className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        {isFullscreen ? (
          <IoMdClose className="w-6 h-6 text-gray-800" />
        ) : (
          <AiOutlineExpand className="w-6 h-6 text-gray-800" />
        )}
      </button>
    </>
  );

  const Thumbnails = () => (
    <div className="flex space-x-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
      {images.map((image, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentIndex(index)}
          className={`relative cursor-pointer rounded-lg overflow-hidden flex-shrink-0 ${
            currentIndex === index ? 'ring-2 ring-purple-500' : ''
          }`}
        >
          <img
            src={image.url}
            alt={`Thumbnail ${index + 1}`}
            className="w-20 h-20 object-cover"
          />
          {currentIndex === index && (
            <div className="absolute inset-0 bg-purple-500/20" />
          )}
        </motion.div>
      ))}
    </div>
  );

  return (
    <>
      <div className="relative">
        <motion.div
          className={`relative overflow-hidden ${
            isFullscreen
              ? 'fixed inset-0 z-50 bg-black'
              : 'rounded-2xl bg-gray-100'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex].url}
              alt={`Image ${currentIndex + 1}`}
              className={`w-full ${
                isFullscreen
                  ? 'h-screen object-contain'
                  : 'h-[500px] object-cover'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
          <ImageControls />
        </motion.div>
        {!isFullscreen && <Thumbnails />}
      </div>
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={toggleFullscreen}
        />
      )}
    </>
  );
};

export default ImageGallery;
