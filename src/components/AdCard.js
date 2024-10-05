import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import Moment from "react-moment";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const AdCard = ({ ad }) => {
  const [users, setUsers] = useState([]);

  const adLink = `/${ad.category.toLowerCase()}/${ad.id}`;

  useEffect(() => {
    const docRef = doc(db, "favorites", ad.id);
    const unsub = onSnapshot(docRef, (querySnapshot) =>
      setUsers(querySnapshot.data()?.users || []) // Use optional chaining here
    );
    return () => unsub();
  }, [ad.id]); // Ensure ad.id is included in the dependency array

  const toggleFavorite = async () => {
    let isFav = users.includes(auth.currentUser.uid);

    await updateDoc(doc(db, "favorites", ad.id), {
      users: isFav
        ? users.filter((id) => id !== auth.currentUser.uid)
        : [...users, auth.currentUser.uid],
    });
  };

  console.log(users);

  return (
    <div className="card">
      <Link to={adLink}>
        <img
          src={ad.images?.[0]?.url || 'default-image-url.jpg'} // Use optional chaining
          alt={ad.title}
          className="card-img-top"
          style={{ width: "100%", height: "200px" }}
        />
      </Link>
      <div className="card-body">
        <p className="d-flex justify-content-between align-items-center">
          <small>{ad.category}</small>
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
          <h5 className="card-title">{ad.title}</h5>
        </Link>
        <Link to={adLink}>
          <p className="card-text">
            {ad.location} - <Moment fromNow>{ad.publishedAt.toDate()}</Moment>
            <br />
            BDT. {Number(ad.price).toLocaleString()}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdCard;
