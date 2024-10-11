import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineStar, AiFillStar } from "react-icons/ai"; // Changed to star icons
import Moment from "react-moment";
import { auth } from "../firebaseConfig";
import useSnapshot from "../utils/useSnapshot";
import { toggleFavorite } from "../utils/fav";
import Sold from "./Sold";

const AdCard = ({ ad }) => {
  // Using useSnapshot to get the favorite data
  const {val} = useSnapshot("favorites", ad.id);

  const adLink = `/${ad.category.toLowerCase()}/${ad.id}`;

  // Safeguard: Check if val and val.users are defined
  const isFavorite = val?.users?.includes(auth.currentUser?.uid);

  return (
    <div className="card mb-3 shadow-sm border-0 relative">
      {ad.isSold && <Sold />}
      <Link to={adLink}>
        <img
          src={ad.images?.[0]?.url || "default-image-url.jpg"}
          alt={ad.title}
          className="card-img-top"
          style={{ width: "100%", height: "200px", borderRadius: "0.25rem" }}
        />
      </Link>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title">{ad.title}</h5>
          {isFavorite ? (
            <AiFillStar
              size={30}
              onClick={() => toggleFavorite(val.users, ad.id)}
              className="text-warning cursor-pointer" // Yellow color for filled star
            />
          ) : (
            <AiOutlineStar
              size={30}
              onClick={() => toggleFavorite(val?.users || [], ad.id)} // Handle undefined users array
              className="text-muted cursor-pointer" // Gray color for outlined star
            />
          )}
        </div>
        <p className="small text-muted">{ad.category}</p> {/* Display category below title */}
        <p className="card-text">
          {ad.location} -{" "}
          <Moment fromNow>{ad.publishedAt.toDate()}</Moment>
          <br />
          <span style={{ fontWeight: "500", fontSize: "1rem", color: "#333" }}>
            {Number(ad.price).toLocaleString()} BDT
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdCard;
