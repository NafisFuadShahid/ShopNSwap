import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { auth } from "../firebaseConfig"; // To access current user UID
import AdCard from "../components/AdCard";
import { Link } from "react-router-dom";

const Buy = () => {
  const [buyAds, setBuyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBuyAds = async () => {
    setLoading(true);
    setError(null);  // Reset error on each fetch attempt
    try {
      // Check if user is logged in before making the query
      if (!auth.currentUser) {
        setError("You must be logged in to view buy listings.");
        setLoading(false);
        return;
      }

      const adsRef = collection(db, "ads");
      const q = query(
        adsRef,
        where("adType", "==", "sell"),
        where("postedBy", "!=", auth.currentUser?.uid) // Exclude ads posted by the current user
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError("No buy listings available at the moment.");
      }

      const ads = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBuyAds(ads);
    } catch (error) {
      console.error("Error fetching ads:", error);
      setError("There was an error fetching the ads. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyAds();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto mb-4" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="70 180"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                dur="1.5s"
                repeatCount="indefinite"
                from="0 50 50"
                to="360 50 50"
              />
            </circle>
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="40 140"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                dur="1.5s"
                repeatCount="indefinite"
                from="360 50 50"
                to="0 50 50"
              />
            </circle>
          </svg>
          <div className="relative">
            <div className="h-1 w-48 bg-blue-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full w-full bg-blue-500 rounded-full animate-loading-bar"></div>
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading sell ads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-5">
        <p className="text-xl text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Buy Listings</h2>
      {buyAds.length === 0 ? (
        <p className="text-xl text-gray-600">No buy listings available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {buyAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Buy;
