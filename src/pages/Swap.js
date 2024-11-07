import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";

const Swap = () => {
  const [swapAds, setSwapAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSwapAds = async () => {
    setLoading(true);
    try {
      const adsRef = collection(db, "ads");
      const q = query(adsRef, where("adType", "==", "swap")); // Filter by adType "swap"
      const querySnapshot = await getDocs(q);

      const ads = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSwapAds(ads);
    } catch (error) {
      console.error("Error fetching swap ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwapAds();
  }, []);

  if (loading) {
    return <p>Loading swap ads...</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-2xl font-bold mb-4">Swap Listings</h2>
      {swapAds.length === 0 ? (
        <p>No swap listings available at the moment.</p>
      ) : (
        <div className="row">
          {swapAds.map((ad) => (
            <div className="col-sm-6 col-md-4 col-xl-3 mb-3" key={ad.id}>
              <AdCard ad={ad} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Swap;
