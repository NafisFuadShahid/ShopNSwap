import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import Moment from "react-moment";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const AdCard = ({ ad }) => {
  const [users, setUsers] = useState([]);

  const adLink = `/${ad.category?.toLowerCase()}/${ad.id}`;

  useEffect(() => {
    if (ad.id) {
      const docRef = doc(db, "favorites", ad.id);
      const unsub = onSnapshot(docRef, (querySnapshot) => {
        const data = querySnapshot.data();
        if (data) {
          setUsers(data.users || []);
        }
      });
      return () => unsub();
    }
  }, [ad.id]);

  const toggleFavorite = async () => {
    const isFav = users.includes(auth.currentUser.uid);

    await updateDoc(doc(db, "favorites", ad.id), {
      users: isFav
        ? users.filter((id) => id !== auth.currentUser.uid)
        : users.concat(auth.currentUser.uid),
    });
  };

  console.log(users);

  return (
    <div className="card">
      <Link to={adLink}>
        <img
          src={ad.images?.[0]?.url || 'default_image_url'}  // Handle missing images gracefully
          alt={ad.title || 'Ad Image'}                      // Fallback alt text if title is missing
          className="card-img-top"
          style={{ width: "100%", height: "200px" }}
        />
      </Link>
      <div className="card-body">
        <p className="d-flex justify-content-between align-items-center">
          <small>{ad.category || "Unknown Category"}</small>  {/* Fallback category */}
          {users?.includes(auth.currentUser?.uid) ? (
            <AiFillHeart
              size={30}
              onClick={toggleFavorite}
              className="text-danger"
            />
          ) : (
            <AiOutlineHeart
              size={30}
              onClick={toggleFavorite}
              className="text-danger"
            />
          )}
        </p>
        <Link to={adLink}>
          <h5 className="card-title">{ad.title || "Untitled Ad"}</h5>  {/* Fallback title */}
        </Link>
        <Link to={adLink}>
          <p className="card-text">
            {ad.location || "Unknown Location"} -{" "}
            {ad.publishedAt ? (
              <Moment fromNow>{ad.publishedAt.toDate()}</Moment>
            ) : (
              "Unknown Date"
            )}
            <br />
            BDT. {ad.price ? Number(ad.price).toLocaleString() : "Price not available"}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdCard;
