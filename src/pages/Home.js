import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const categories = [
  "Vehicles",
  "Property",
  "Electronics",
  "Home",
  "Fashion",
  "Jobs",
  "Services",
  "Pets",
  "Sports",
  "Hobbies",
  "Kids",
  "Business",
  "Health",
  "Education",
  "Travel",
  "Events",
  "Agriculture",
  "Others",
];

const Home = () => {
  const [ads, setAds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // State to store the selected category
  const [sortOption, setSortOption] = useState("latest"); // Default sort option is "Latest"
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const categoryRef = useRef(null); // Reference to the category container

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
    adDocs.forEach((doc) => ads.push({ ...doc.data(), id: doc.id }));

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

  const checkScrollPosition = () => {
    const { scrollLeft, scrollWidth, clientWidth } = categoryRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
  };

  const scrollRight = () => {
    categoryRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  const scrollLeft = () => {
    categoryRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
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
            position: relative;
            display: flex;
            align-items: center;
            overflow-x: auto;
            padding-bottom: 10px;
            gap: 20px;
          }
          .category-card {
<<<<<<< HEAD
=======
            width: 120px; /* Ensures square shape */
            height: 120px; /* Ensures square shape */
>>>>>>> ee9c4bb5745120291516cc894fbf78d5569adcc7
            display: flex;
            align-items: center;
<<<<<<< HEAD
            background-color: #ffffff;
            border-radius: 8px; /* Rounded edges */
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: border 0.3s, background-color 0.3s;
            cursor: pointer;
            margin-right: 10px;
          }
          .category-card:hover {
            background-color: #f0f0f0;
          }
          .category-image-container {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%; /* Makes it circular */
            background-color: #eee; /* Light background for images */
            margin-right: 15px; /* Space between image and text */
            flex-shrink: 0;
          }
          .category-image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
=======
            justify-content: center;
            border-radius: 8px; /* Slightly rounded edges */
            background-color: #ffffff; /* White background for category cards */
            transition: border 0.3s;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
            margin-right: 10px; /* Spacing between category cards */
          }
          .category-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            margin-bottom: 8px;
>>>>>>> ee9c4bb5745120291516cc894fbf78d5569adcc7
          }
          .category-label {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
          .selected-category {
            border: 3px solid blue !important;
          }
        `}
      </style>

      <h3 className="text-2xl font-500 my-10  ">Categories</h3>
      <div
        className="category-container position-relative"
        onMouseEnter={() => checkScrollPosition()}
      >
        {showLeftArrow && (
          <button className="arrow-left" onClick={scrollLeft}>
            <FaChevronLeft size={24} />
          </button>
        )}
        <div
          className="d-flex overflow-hidden mb-4"
          ref={categoryRef}
          style={{ overflowX: "auto" }}
          onScroll={checkScrollPosition}
        >
          {categories.map((category, index) => (
            <button
              key={index}
<<<<<<< HEAD
              onClick={() => handleCategoryClick(category)}
=======
              onClick={() => handleCategoryClick(category)} // Set the selected category on click
>>>>>>> ee9c4bb5745120291516cc894fbf78d5569adcc7
              className="text-decoration-none"
              style={{ border: "none", background: "none", padding: "0" }}
            >
              <div
                className={`category-card ${
                  selectedCategory === category ? "selected-category" : ""
                }`}
              >
<<<<<<< HEAD
                <div className="category-image-container">
                  <img
                    src={`/images/${category}.jpg`}
                    onError={(e) => (e.target.src = "https://static.thenounproject.com/png/2932881-200.png")}
                    alt={category}
                    className="category-image"
                  />
                </div>
                <span className="category-label">{category}</span>
=======
                <img
                  src={`/images/${category}.jpg`} // Dynamically load images from public/images directory
                  onError={(e) => (e.target.src = "https://static.thenounproject.com/png/2932881-200.png")} // Fallback image
                  alt={category}
                  className="category-image"
                />
                <h6>{category}</h6> {/* Adjusted text size to fit the square design */}
>>>>>>> ee9c4bb5745120291516cc894fbf78d5569adcc7
              </div>
            </button>
          ))}
        </div>
        {showRightArrow && (
          <button className="arrow-right" onClick={scrollRight}>
            <FaChevronRight size={24} />
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

      <h3 className="text-2xl font-500 my-10  ">{selectedCategory ? `${selectedCategory} Listings` : "Recent Listings"}</h3>
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
