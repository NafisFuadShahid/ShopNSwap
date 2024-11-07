import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const categories = [
  "Vehicles", "Property", "Electronics", "Home", "Fashion", "Jobs", "Services", "Pets",
  "Sports", "Hobbies", "Kids", "Business", "Health", "Education", "Travel", "Events",
  "Agriculture", "Others"
];

const Home = () => {
  const [ads, setAds] = useState({ sell: [], swap: [], donate: [] });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState("latest");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const categoryRef = useRef(null);

  const getAds = async (category = null, sortOption = "latest") => {
    const adsRef = collection(db, "ads");
    let q = category ? query(adsRef, where("category", "==", category)) : query(adsRef);

    const adDocs = await getDocs(q);
    let fetchedAds = { sell: [], swap: [], donate: [] };
    adDocs.forEach((doc) => {
      const ad = doc.data();
      if (fetchedAds[ad.adType]) {
        fetchedAds[ad.adType].push(ad);
      }
    });

    // Sort ads for each type
    Object.keys(fetchedAds).forEach(type => {
      if (sortOption === "low") {
        fetchedAds[type].sort((a, b) => a.price - b.price);
      } else if (sortOption === "high") {
        fetchedAds[type].sort((a, b) => b.price - a.price);
      } else if (sortOption === "latest") {
        fetchedAds[type].sort((a, b) => b.publishedAt - a.publishedAt);
      }
    });

    setAds(fetchedAds);
  };

  useEffect(() => {
    getAds(selectedCategory, sortOption);
  }, [selectedCategory, sortOption]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const scrollRight = () => {
    categoryRef.current.scrollBy({ left: 200, behavior: "smooth" });
    updateArrowVisibility();
  };

  const scrollLeft = () => {
    categoryRef.current.scrollBy({ left: -200, behavior: "smooth" });
    updateArrowVisibility();
  };

  const updateArrowVisibility = () => {
    const { scrollLeft, scrollWidth, clientWidth } = categoryRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <style jsx>{`
        .category-container {
          display: flex;
          align-items: center;
          overflow-x: hidden;
          gap: 20px;
          padding-bottom: 20px;
          position: relative;
        }
        .category-card {
          display: flex;
          align-items: center;
          background-color: #ffffff;
          border-radius: 50px;
          padding: 15px 25px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .category-card:hover {
          background-color: #f0f9ff;
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .category-image-container {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: #f3f4f6;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .category-image {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }
        .category-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        .selected-category {
          background-color: #3b82f6;
          color: white;
        }
        .selected-category .category-label {
          color: white;
        }
        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: #ffffff;
          color: #3b82f6;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .arrow:hover {
          background-color: #3b82f6;
          color: white;
        }
        .arrow-left {
          left: -20px;
        }
        .arrow-right {
          right: -20px;
        }
        .dropdown-custom {
          appearance: none;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 0.5rem 2.5rem 0.5rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: #374151;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }
        .ad-type-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .ad-type-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          text-transform: capitalize;
        }
      `}</style>

      <h2 className="text-3xl font-bold mb-6 text-gray-800">Categories</h2>

      <div className="relative">
        {showLeftArrow && (
          <button className="arrow arrow-left" onClick={scrollLeft}>
            <FaChevronLeft size={18} />
          </button>
        )}
        <div
          className="category-container"
          ref={categoryRef}
          onScroll={updateArrowVisibility}
        >
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category)}
              className="focus:outline-none"
            >
              <div
                className={`category-card ${
                  selectedCategory === category ? "selected-category" : ""
                }`}
              >
                <div className="category-image-container">
                  <img
                    src={`/images/${category.toLowerCase()}.png`}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/24")}
                    alt={category}
                    className="category-image"
                  />
                </div>
                <span className="category-label">{category}</span>
              </div>
            </button>
          ))}
        </div>
        {showRightArrow && (
          <button className="arrow arrow-right" onClick={scrollRight}>
            <FaChevronRight size={18} />
          </button>
        )}
      </div>

      <div className="mt-8 mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">
          {selectedCategory ? `${selectedCategory} Listings` : "Recent Listings"}
        </h2>
        <div>
          <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By:
          </label>
          <select
            id="sort-select"
            className="dropdown-custom"
            onChange={(e) => setSortOption(e.target.value)}
            value={sortOption}
          >
            <option value="latest">Latest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {Object.entries(ads).map(([adType, adList]) => (
        <div key={adType} className="ad-type-section">
          <h3 className="ad-type-title">{adType}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {adList.map((ad) => (
              <div key={ad.adId}>
                <AdCard ad={ad} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;