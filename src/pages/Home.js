import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const categories = [
  "Vehicles", "Property", "Electronics", "Home", "Fashion", "Jobs", 
  "Services", "Pets", "Sports", "Hobbies", "Kids", "Business", 
  "Health", "Education", "Travel", "Events", "Agriculture", "Others"
];

const Home = () => {
  const [ads, setAds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState("latest");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const categoryRef = useRef(null);

  const getAds = async (category = null, sortOption = "latest") => {
    const adsRef = collection(db, "ads");
    let q;

    if (category) {
      q = query(adsRef, where("category", "==", category));
    } else {
      q = query(adsRef);
    }

    const adDocs = await getDocs(q);
    let ads = [];
    adDocs.forEach((doc) => ads.push({ ...doc.data()}));

    if (sortOption === "low") {
      ads.sort((a, b) => a.price - b.price);
    } else if (sortOption === "high") {
      ads.sort((a, b) => b.price - a.price);
    } else if (sortOption === "latest") {
      ads.sort((a, b) => b.publishedAt - a.publishedAt);
    }

    setAds(ads);
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
    <div className="mt-5 container">
      <style>
        {`
          body {
            background-color: #fdfdfd;
            color: #333;
          }
          .category-container {
            display: flex;
            align-items: center;
            overflow-x: hidden;
            gap: 20px;
            padding-bottom: 10px;
            position: relative;
          }
.category-card {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, background-color 0.3s;
  cursor: pointer;
}

.category-card:hover {
  background-color: #e6f4ff; /* Lighter blue color on hover */
  transform: translateY(-5px);
}

.category-image-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #eee;
  margin-right: 15px;
  flex-shrink: 0;
}

.category-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.category-label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.selected-category {
  border: 3px solid #007bff !important;
}

          .arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ffffff; /* Default color */
  color: #007bff; /* Default icon color */
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: background-color 0.3s, opacity 0.3s;
}

.arrow:hover {
  background-color: #007bff; /* Change to blue on hover */
  color: white; /* Change icon color to white */
  opacity: 1; /* Full opacity on hover */
}

.arrow-left {
  left: -15px;
}

.arrow-right {
  right: -15px;
}

        `}
      </style>

      <h3 className="text-2xl font-500 my-10">Categories</h3>

      <div className="position-relative d-flex align-items-center">
        {showLeftArrow && (
          <button className="arrow arrow-left" onClick={scrollLeft}>
            <FaChevronLeft size={18} />
          </button>
        )}
        <div className="category-container" ref={categoryRef} onScroll={updateArrowVisibility}>
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category)}
              className="text-decoration-none"
              style={{ border: "none", background: "none", padding: "0" }}
            >
              <div
                className={`category-card ${
                  selectedCategory === category ? "selected-category" : ""
                }`}
              >
                <div className="category-image-container">
                  <img
                    src={`/images/${category}.jpg`}
                    onError={(e) => (e.target.src = "https://static.thenounproject.com/png/2932881-200.png")}
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

      {selectedCategory && (
        <div className="mb-4">
          <h5>Sort By:</h5>
          <select
            className="dropdown-custom"
            onChange={(e) => setSortOption(e.target.value)}
            value={sortOption}
          >
            <option value="latest">Latest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
      )}

      <h3 className="text-2xl font-500 my-10">
        {selectedCategory ? `${selectedCategory} Listings` : "Recent Listings"}
      </h3>
      <div className="row">
        {ads.map((ad) => (
          <div className="col-sm-6 col-md-4 col-xl-3 mb-3" key={ad.adId}>
            <AdCard ad={ad} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
