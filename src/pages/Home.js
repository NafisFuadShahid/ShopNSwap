import React, { useState, useEffect, useRef } from "react";
import { collection, orderBy, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const categories = [
  "Vehicles",
  "Property",
  "Electronics",
  "Home & Garden",
  "Fashion & Beauty",
  "Jobs",
  "Services",
  "Pets",
  "Sports & Outdoors",
  "Hobbies & Leisure",
  "Kids & Baby Products",
  "Business & Industrial",
  "Health & Wellness",
  "Education",
  "Travel & Tourism",
  "Events",
  "Agriculture & Farming",
  "Others",
];

const Home = () => {
  const [ads, setAds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // State to store the selected category
  const [sortOption, setSortOption] = useState("latest"); // Default sort option is "Latest"
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const categoryRef = useRef(null); // Reference to the category container

  // Function to fetch ads from Firestore, optionally filtered by category and sorted by price or publish date
  const getAds = async (category = null, sortOption = "latest") => {
    const adsRef = collection(db, "ads");
    let q;

    // If category is selected, filter by category
    if (category) {
      q = query(adsRef, where("category", "==", category));
    } else {
      // Show all ads if no category is selected
      q = query(adsRef);
    }

    const adDocs = await getDocs(q);
    let ads = [];
    adDocs.forEach((doc) => ads.push({ ...doc.data(), id: doc.id }));

    // Sorting logic
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
    // Fetch ads whenever the selected category or sort option changes
    getAds(selectedCategory, sortOption);
  }, [selectedCategory, sortOption]);

  const checkScrollPosition = () => {
    const { scrollLeft, scrollWidth, clientWidth } = categoryRef.current;

    // Show left arrow if scrolled right more than 0
    setShowLeftArrow(scrollLeft > 0);

    // Show right arrow if not completely scrolled to the right
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
  };

  const scrollRight = () => {
    categoryRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  const scrollLeft = () => {
    categoryRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  // Function to handle category selection and toggle filter
  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      // If the category is already selected, reset the filter
      setSelectedCategory(null);
    } else {
      // Otherwise, set the clicked category as the selected one
      setSelectedCategory(category);
    }
  };

  return (
    <div className="mt-5 container">
      <style>
        {`
          body {
            background-color: #fdfdfd; /* Off-white background for the entire page */
            color: #333; /* Dark text for readability */
          }
          .category-container {
            position: relative;
          }
          .category-card {
<<<<<<< HEAD
=======
            width: 120px; /* Ensures square shape */
            height: 120px; /* Ensures square shape */
>>>>>>> f28f3d3979f351030be47e83952a9d19b9451ef6
            display: flex;
            flex-direction: column;
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
>>>>>>> f28f3d3979f351030be47e83952a9d19b9451ef6
          }
          .d-flex {
            scrollbar-width: none; /* For Firefox */
          }
          .d-flex::-webkit-scrollbar {
            display: none; /* For Chrome, Safari, and Opera */
          }
          .arrow-right, .arrow-left {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(0, 0, 0, 0.7); /* Dark background for arrows */
            color: white;
            border: none;
            padding: 10px;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10;
          }
          .arrow-right {
            right: 10px;
          }
          .arrow-left {
            left: 10px;
          }
          .category-container:hover .arrow-right, .category-container:hover .arrow-left {
            opacity: 1;
          }
          .selected-category {
            border: 3px solid blue !important; /* Blue outline for the selected category, with !important to ensure it applies */
          }

          /* Dropdown Customization */
          .dropdown-custom {
            width: 200px; /* Make the dropdown smaller */
            border-radius: 20px; /* Rounded corners */
            padding: 8px 12px;
            background-color: #ffffff; /* White background for the dropdown */
            border: 1px solid #ccc; /* Add a light border */
            transition: all 0.3s ease; /* Smooth transition */
          }

          .dropdown-custom:hover {
            background-color: #e6e6e6; /* Slightly darker on hover */
            border-color: #888; /* Darker border on hover */
          }

          .dropdown-custom:focus {
            outline: none;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); /* Shadow on focus */
          }
        `}
      </style>

      <h3>Categories</h3>
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
>>>>>>> f28f3d3979f351030be47e83952a9d19b9451ef6
              className="text-decoration-none"
              style={{ border: "none", background: "none", padding: "0" }}
            >
              <div
                className={`category-card text-center p-3 border rounded shadow-sm ${
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
>>>>>>> f28f3d3979f351030be47e83952a9d19b9451ef6
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

      {/* Sorting Dropdown */}
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

      <h3>{selectedCategory ? `${selectedCategory} Listings` : "Recent Listings"}</h3>
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