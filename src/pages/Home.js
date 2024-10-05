import React, { useState, useEffect } from "react";
import { collection, orderBy, query, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";

const Home = () => {
  const [ads, setAds] = useState([]);

  const getAds = async () => {
    const adsRef = collection(db, "ads");
    const q = query(adsRef, orderBy("publishedAt", "desc"));
    const adDocs = await getDocs(q);
    let ads = [];
    adDocs.forEach((doc) => ads.push({ ...doc.data(), id: doc.id }));
    setAds(ads);
  };

  useEffect(() => {
    getAds();
  }, []);
  console.log(ads);
  return (
    <div className="mt-5 container">
      <h3>Recent Listings</h3>
      <div className="row">
        {ads.map((ad) => (
          <div className="col-sm-6 col-md-4 col-xl-3 mb-3" key={ad.id}>
            <AdCard ad={ad} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
