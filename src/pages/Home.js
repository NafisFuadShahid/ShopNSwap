import React, { useState, useEffect, useRef } from "react";
import { collection, orderBy, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa"; // Importing left and right arrow icons

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
          .category-container {
            position: relative;
          }
          .category-card {
            min-width: 150px;
            height: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 50%; /* Makes the cards circular */
            background-color: #f9f9f9;
            transition: border 0.3s;
          }
          .category-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 50%;
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
            background-color: rgba(0, 0, 0, 0.5);
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
            background-color: #f1f1f1; /* Light gray background */
            border: 1px solid #ccc; /* Add a light border */
            transition: all 0.3s ease; /* Smooth transition */
          }

          .dropdown-custom:hover {
            background-color: #e2e2e2; /* Slightly darker on hover */
            border-color: #888; /* Darker border on hover */
          }

          .dropdown-custom:focus {
            outline: none;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); /* Shadow on focus */
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
              onClick={() => handleCategoryClick(category)} // Set the selected category on click
              className="text-decoration-none me-3"
              style={{ border: "none", background: "none", padding: "0" }}
            >
              <div
                className={`category-card text-center p-3 border rounded shadow-sm ${
                  selectedCategory === category ? "selected-category" : ""
                }`}
              >
                <img
                  src={`/images/category-${index}.png`} // Ensure these images exist in the public folder
                  onError={(e) => (e.target.src = "/images/default-category.png")} // Fallback image
                  alt={category}
                  className="category-image mb-2"
                />
                <h5>{category}</h5>
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
