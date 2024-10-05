import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineStar, AiFillStar } from "react-icons/ai"; // Changed to star icons
import Moment from "react-moment";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const AdCard = ({ ad }) => {
  const [users, setUsers] = useState([]);

  const adLink = `/${ad.category.toLowerCase()}/${ad.id}`;

  useEffect(() => {
    const docRef = doc(db, "favorites", ad.id);
    const unsub = onSnapshot(docRef, (querySnapshot) =>
      setUsers(querySnapshot.data()?.users || [])
    );
    return () => unsub();
  }, [ad.id]);

  const toggleFavorite = async () => {
    const isFav = users.includes(auth.currentUser.uid);

    await updateDoc(doc(db, "favorites", ad.id), {
      users: isFav
        ? users.filter((id) => id !== auth.currentUser.uid)
        : [...users, auth.currentUser.uid],
    });
  };

  return (
    <div className="card mb-3 shadow-sm border-0">
      <Link to={adLink}>
        <img
          src={ad.images?.[0]?.url || 'default-image-url.jpg'}
          alt={ad.title}
          className="card-img-top"
          style={{ width: "100%", height: "200px", borderRadius: '0.25rem' }}
        />
      </Link>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title">{ad.title}</h5>
          {users?.includes(auth.currentUser?.uid) ? (
            <AiFillStar
              size={30}
              onClick={toggleFavorite}
              className="text-warning cursor-pointer" // Change color to yellow for filled star
            />
          ) : (
            <AiOutlineStar
              size={30}
              onClick={toggleFavorite}
              className="text-muted cursor-pointer" // Change color to gray for outline star
            />
          )}
        </div>
        <p className="small text-muted">{ad.category}</p> {/* Display category below title */}
        <p className="card-text">
          {ad.location} - <Moment fromNow>{ad.publishedAt.toDate()}</Moment>
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