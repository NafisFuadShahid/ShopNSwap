import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      if (searchQuery) {
        try {
          console.log("Searching for:", searchQuery);
          const adsRef = collection(db, "ads");
          
          // Get all ads (with a reasonable limit)
          const q = query(adsRef, orderBy("title"), limit(100));
          const querySnapshot = await getDocs(q);
          
          // Filter client-side for case-insensitive matching
          const searchResults = querySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(ad => {
              // Case-insensitive search in title
              const titleMatches = ad.title && 
                ad.title.toLowerCase().includes(searchQuery.toLowerCase());
              
              // Case-insensitive search in category
              const categoryMatches = ad.category && 
                ad.category.toLowerCase().includes(searchQuery.toLowerCase());
              
              // Case-insensitive search in description (if available)
              const descriptionMatches = ad.description && 
                ad.description.toLowerCase().includes(searchQuery.toLowerCase());
              
              // Return true if any of the fields match
              return titleMatches || categoryMatches || descriptionMatches;
            });
          
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for "{searchQuery}"
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((ad) => (
            <AdCard
              key={ad.id}
              ad={{
                ...ad,
                adId: ad.id,
                publishedAt: ad.publishedAt?.toDate 
                  ? ad.publishedAt 
                  : { toDate: () => new Date(ad.publishedAt) }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg mb-4">No results found for "{searchQuery}"</p>
          <p className="text-gray-500">Try different keywords or check your spelling</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;