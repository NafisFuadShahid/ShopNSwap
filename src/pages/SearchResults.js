import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q"); // Get the search query from URL
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      if (searchQuery) {
        console.log("Searching for:", searchQuery);
        const adsRef = collection(db, "ads");
        const lowercaseQuery = searchQuery.toLowerCase();
        
        const q = query(
          adsRef,
          where("title", ">=", lowercaseQuery),
          where("title", "<=", lowercaseQuery + "\uf8ff"),
          orderBy("title"),
          limit(20)
        );

        console.log("Query:", q);

        try {
          const querySnapshot = await getDocs(q);
          const searchResults = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          console.log("Search results:", searchResults);
          setResults(searchResults);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      }
      setLoading(false);
    };

    fetchResults();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h1>
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((ad) => (
            <AdCard 
              key={ad.id} 
              ad={{
                ...ad,
                adId: ad.id,
                publishedAt: ad.publishedAt?.toDate ? ad.publishedAt : { toDate: () => new Date(ad.publishedAt) }
              }} 
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-8">No results found. Try a different search term.</p>
      )}
    </div>
  );
};

export default SearchResults;