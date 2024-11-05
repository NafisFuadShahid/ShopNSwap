import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart, AiOutlineStar } from "react-icons/ai";
import Moment from "react-moment";
import { auth } from "../firebaseConfig";
import useSnapshot from "../utils/useSnapshot";
import { toggleFavorite } from "../utils/fav";
import Sold from "./Sold";

const AdCard = ({ ad }) => {
  const { val } = useSnapshot("favorites", ad.id);
  const adLink = `/${ad.category.toLowerCase()}/${ad.id}`;
  const isFavorite = val?.users?.includes(auth.currentUser?.uid);

  return (
    <div className="rounded-lg w-full max-w-md bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 mb-3 mx-1 relative">
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
          <div>
            {isFavorite ? (
              <AiFillHeart
                size={20}
                onClick={() => toggleFavorite(val.users, ad.id)}
                className="text-pink-500 cursor-pointer"
              />
            ) : (
              <AiOutlineHeart
                size={20}
                onClick={() => toggleFavorite(val?.users || [], ad.id)}
                className="text-gray-300 cursor-pointer"
              />
            )}
          </div>
        </div>

        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, index) => (
            <AiOutlineStar key={index} size={16} className="text-yellow-300" />
          ))}
          <span className="text-xs font-medium text-gray-600 ml-2">5.0</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {Number(ad.price).toLocaleString()} BDT
          </span>
          <div className="text-right">
            <span className="text-xs text-gray-700 dark:text-gray-300">
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
