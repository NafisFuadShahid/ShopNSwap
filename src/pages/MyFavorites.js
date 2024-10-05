import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import AdCard from "../components/AdCard";

const MyFavorites = () => {
  const [ads, setAds] = useState([]);

  const getAds = async () => {
    // get ads from fav collection where users includes logged in user
    const favRef = collection(db, "favorites");
    const q = query(
      favRef,
      where("users", "array-contains", auth.currentUser.uid)
    );
    const docsSnap = await getDocs(q);

    let promises = [];
    docsSnap.forEach(async (doc) => {
      const adsRef = collection(db, "ads");
      const q = query(adsRef, where(documentId(), "==", doc.id));
      promises.push(getDocs(q));
    });
    let ads = [];
    const docs = await Promise.all(promises);
    docs.forEach((querySnap) =>
      querySnap.forEach((dSnap) => ads.push({ ...dSnap.data(), id: dSnap.id }))
    );
    setAds(ads);
  };

  useEffect(() => {
    getAds();
  }, []);
  
  return (
    <div className="mt-5 container">
      {ads.length ? <h3>Favorite Products</h3> : <h3>No Favorite Product</h3>}
      <div className="row">
        {ads.map((ad) => (
          <div key={ad.id} className="col-sm-6 col-md-3 mb-3">
            <AdCard ad={ad} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyFavorites;
