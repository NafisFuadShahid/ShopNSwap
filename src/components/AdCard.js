import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { IoLocationOutline, IoTimeOutline } from "react-icons/io5";
import { BsThreeDots, BsShare } from "react-icons/bs";
import { BiMessageDetail } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import Moment from "react-moment";
import { auth } from "../firebaseConfig";
import useSnapshot from "../utils/useSnapshot";
import { toggleFavorite } from "../utils/fav";
import Sold from "./Sold";

const AdCard = ({ ad, index }) => {
  const adId = ad.adId || ad.id;
  const { val } = useSnapshot("favorites", adId);
  const adLink = `/${ad.category?.toLowerCase()}/${adId}`;
  const isFavorite = val?.users?.includes(auth.currentUser?.uid);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    toggleFavorite(val?.users || [], adId);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const getFormattedDate = () => {
    if (ad.timestamp?.toDate) {
      return <Moment fromNow>{ad.timestamp.toDate()}</Moment>;
    }
    if (ad.publishedAt?.toDate) {
      return <Moment fromNow>{ad.publishedAt.toDate()}</Moment>;
    }
    if (ad.createdAt?.toDate) {
      return <Moment fromNow>{ad.createdAt.toDate()}</Moment>;
    }
    return "Recently";
  };

  const getAdTypeStyles = () => {
    switch (ad.adType?.toLowerCase()) {
      case 'sell':
        return 'from-primary-500 to-purple-600';
      case 'swap':
        return 'from-cyan-500 to-blue-600';
      case 'donate':
        return 'from-emerald-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (!ad) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative h-full"
      onMouseEnter={() => {
        setShowOptions(true);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setShowOptions(false);
        setIsHovered(false);
      }}
    >
      {/* Card container with glass effect */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300" />
      
      <Link to={adLink} className="block relative h-full rounded-2xl overflow-hidden">
        {/* Image container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            className="absolute inset-0 h-full w-full object-cover"
            src={ad.images?.[0]?.url || "/placeholder-image.jpg"}
            alt={ad.title || "Product"}
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Gradient overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />

          {/* Ad type badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getAdTypeStyles()} shadow-lg capitalize`}>
              {ad.adType || "For Sale"}
            </div>
          </div>

          {/* Quick actions */}
          <motion.div 
            className="absolute top-3 right-3 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: showOptions ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={handleFavoriteClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full backdrop-blur-md ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              } shadow-lg`}
            >
              {isFavorite ? (
                <AiFillHeart className="w-5 h-5" />
              ) : (
                <AiOutlineHeart className="w-5 h-5" />
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {ad.title}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <IoLocationOutline className="w-4 h-4" />
              <span className="truncate">{ad.address || "Location unavailable"}</span>
            </div>
            <div className="flex items-center gap-1">
              <IoTimeOutline className="w-4 h-4" />
              <span>{getFormattedDate()}</span>
            </div>
          </div>

          {ad.price && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                ₹{ad.price}
              </span>
              {ad.negotiable && (
                <span className="text-xs text-gray-500">(Negotiable)</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default AdCard;