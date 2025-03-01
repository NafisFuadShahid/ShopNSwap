import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart, AiFillStar, AiOutlineStar } from "react-icons/ai";
import Moment from "react-moment";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import useSnapshot from "../utils/useSnapshot";
import { toggleFavorite } from "../utils/fav";
import Sold from "./Sold";

// Reuse the same star-rendering logic as in your ReviewSection
function renderStars(rating = 0) {
  const rounded = Math.round(rating);
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(<AiFillStar key={i} className="text-yellow-400" />);
    } else {
      stars.push(<AiOutlineStar key={i} className="text-yellow-400" />);
    }
  }
  return stars;
}

const AdCard = ({ ad }) => {
  // --- Favorites snapshot logic ---
  const { val } = useSnapshot("favorites", ad.adId);
  const isFavorite = val?.users?.includes(auth.currentUser?.uid);
  const favoritesCount = val?.users ? val.users.length : 0;
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Rating logic ---
  const [averageRating, setAverageRating] = useState(0);
  const [loadingRating, setLoadingRating] = useState(true);

  // --- Fetch & compute reviews on mount ---
  useEffect(() => {
    let isMounted = true;

    async function fetchReviews() {
      setLoadingRating(true);
      try {
        const q = query(collection(db, "reviews"), where("adId", "==", ad.adId));
        const querySnapshot = await getDocs(q);
        const reviews = querySnapshot.docs.map((doc) => doc.data());

        if (reviews.length === 0) {
          if (isMounted) setAverageRating(0);
        } else {
          // Sum all ratings, divide by total
          const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          const avg = totalRating / reviews.length;
          if (isMounted) setAverageRating(avg);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        if (isMounted) setAverageRating(0);
      } finally {
        if (isMounted) setLoadingRating(false);
      }
    }

    if (ad.adId) fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [ad.adId]);

  // --- Favorite toggle ---
  const handleFavoriteClick = () => {
    setIsAnimating(true);
    toggleFavorite(val.users, ad.adId);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Construct link to the single ad page
  const adLink = `/${ad.category.toLowerCase()}/${ad.adId}`;

  return (
    <div className="rounded-lg w-full max-w-md bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 mb-3 mx-1 relative transition-transform duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
      {ad.isSold && <Sold />}

      <Link to={adLink}>
        <img
          className="rounded-t-lg w-full h-44 object-cover"
          src={ad.images?.[0]?.url || "default-image-url.jpg"}
          alt={ad.title}
        />
      </Link>

      <div className="px-3 py-3">
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-700 rounded px-1.5 py-0.5 inline-block mb-1">
          {ad.category}
        </span>

        <div className="flex justify-between items-center mb-1">
          <Link to={adLink}>
            <h5 className="text-md font-semibold tracking-tight text-gray-900 dark:text-white">
              {ad.title}
            </h5>
          </Link>
          <div className="flex flex-col items-center">
            <div
              onClick={handleFavoriteClick}
              className={`cursor-pointer transition-transform duration-300 ${
                isAnimating ? "animate-heart" : ""
              }`}
            >
              {isFavorite ? (
                <AiFillHeart size={27} className="text-pink-500" />
              ) : (
                <AiOutlineHeart size={27} className="text-gray-300" />
              )}
            </div>
            <span className="text-xs text-gray-600 mt-1">{favoritesCount}</span>
          </div>
        </div>

        {/* Dynamic rating stars */}
        <div className="flex items-center mb-2">
          {loadingRating ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : (
            <>
              {renderStars(averageRating)}
              <span className="text-xs font-medium text-gray-600 ml-2">
                {averageRating ? averageRating.toFixed(1) : "0.0"}
              </span>
            </>
          )}
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {Number(ad.price).toLocaleString()} BDT
          </span>
          <div className="text-right">
            <span className="text-xs text-gray-700 dark:text-gray-300 block">
              {ad.location}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 block">
              <Moment fromNow>{ad.publishedAt.toDate()}</Moment>
            </span>
          </div>
        </div>

        <Link
          to={adLink}
          className="block text-center text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 focus:ring-2 focus:ring-indigo-400 rounded-md text-sm px-3 py-2 transition-transform transform hover:scale-105"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default AdCard;
