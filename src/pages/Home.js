import React, { useState, useEffect, useRef } from "react";
import { collection, orderBy, query, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AdCard from "../components/AdCard";
import { Link } from "react-router-dom";
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
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const categoryRef = useRef(null); // Reference to the category container

  const getAds = async () => {
    const adsRef = collection(db, "ads");
    const q = query(adsRef, orderBy("publishedAt", "desc"));
    const adDocs = await getDocs(q);
    let ads = [];
    adDocs.forEach((doc) => ads.push({ ...doc.data(), id: doc.id }));
    setAds(ads);
  };

  useEffect(() => {
    getAds();
  }, []);

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
            <Link
              to={`/category/${category.toLowerCase()}`}
              key={index}
              className="text-decoration-none me-3"
            >
              <div className="category-card text-center p-3 border rounded shadow-sm">
                <img
                  src={`/images/category-${index}.png`} // Placeholder for your image
                  alt={category}
                  className="category-image mb-2"
                />
                <h5>{category}</h5>
              </div>
            </Link>
          ))}
        </div>
        {showRightArrow && (
          <button className="arrow-right" onClick={scrollRight}>
            <FaChevronRight size={24} />
          </button>
        )}
      </div>

      <h3>Recent Listings</h3>
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
