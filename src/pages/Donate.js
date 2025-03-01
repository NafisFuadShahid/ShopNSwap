import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { auth } from "../firebaseConfig";
import AdCard from "../components/AdCard";

const Donate = () => {
  const [donateAds, setDonateAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchDonateAds = async () => {
    setLoading(true);
    setError(null);  
    try {
      if (!auth.currentUser) {
        setError("You must be logged in to view donation listings.");
        setLoading(false);
        return;
      }

      const adsRef = collection(db, "ads");
      const q = query(
        adsRef,
        where("adType", "==", "donate"),
        where("postedBy", "!=", auth.currentUser?.uid) 
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No donation listings available at the moment.");
      }

      const ads = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDonateAds(ads);
    } catch (error) {
      console.error("Error fetching ads:", error);
      setError("There was an error fetching the ads. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonateAds();
  }, []);

  const filteredAds = donateAds.filter((ad) =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAds = [...filteredAds].sort((a, b) => {
    if (sortBy === "newest") return b.publishedAt - a.publishedAt;
    if (sortBy === "oldest") return a.publishedAt - b.publishedAt;
    if (sortBy === "priceLowToHigh") return a.price - b.price;
    if (sortBy === "priceHighToLow") return b.price - a.price;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-100 to-purple-100">
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
          <p className="mt-4 text-lg font-medium text-gray-700">Loading donation ads...</p>
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
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Discover Generous Donations</h2>
          <p className="text-xl text-gray-600">Find amazing items being donated by our community</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <input
            type="text"
            placeholder="Search donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-4 sm:mt-0 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
          </select>
        </div>

        {sortedAds.length === 0 ? (
          <p className="text-xl text-gray-600">No donation listings available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Donate;