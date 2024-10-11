import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import Moment from "react-moment";
import { auth } from "../firebaseConfig";
import useSnapshot from "../utils/useSnapshot";
import { toggleFavorite } from "../utils/fav";
import Sold from "./Sold";

const AdCard = ({ ad }) => {
  // Using useSnapshot to get the favorite data
  const { val } = useSnapshot("favorites", ad.id);
  const adLink = `/${ad.category.toLowerCase()}/${ad.id}`;
  const isFavorite = val?.users?.includes(auth.currentUser?.uid);

  return (
    <div className=" rounded-2xl w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 mb-5 relative">
      {ad.isSold && <Sold />} {/* Show Sold overlay if the item is sold */}

      <Link to={adLink}>
        <img
          className="mb-3 rounded-t-lg w-full h-48 object-cover"
          src={ad.images?.[0]?.url || "default-image-url.jpg"}
          alt={ad.title}
        />
      </Link>

      <div className="px-5 pb-5">
        {/* Category Badge */}
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-700 rounded-lg px-2 py-0.5 inline-block mb-2">
          {ad.category}
        </span>

        <Link to={adLink}>
          <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
            {ad.title}
          </h5>
        </Link>

        <div className="flex items-center mt-2.5 mb-5">
          {/* Star Rating */}
          <div className="flex items-center space-x-1">
            {isFavorite ? (
              <AiFillStar
                size={24}
                onClick={() => toggleFavorite(val.users, ad.id)}
                className="text-yellow-300 cursor-pointer"
              />
            ) : (
              <AiOutlineStar
                size={24}
                onClick={() => toggleFavorite(val?.users || [], ad.id)}
                className="text-gray-300 cursor-pointer"
              />
            )}
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded ms-3">
            {/* Rating or some score */}
            5.0
          </span>
        </div>

        <div className="flex items-center justify-between">
          {/* Price and Location */}
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {Number(ad.price).toLocaleString()} BDT
          </span>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {ad.location}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <Moment fromNow>{ad.publishedAt.toDate()}</Moment>
            </span>
          </div>
        </div>

        <Link
  to={adLink}
  className="mt-4 w-full inline-block text-center text-white bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-indigo-500 hover:to-purple-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm px-6 py-3 transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl"
>
  View Details
</Link>

      </div>
    </div>
  );
};

export default AdCard;
