import React, { useState, useCallback, useEffect, useContext } from "react";
import { PiUploadDuotone } from "react-icons/pi";
import { FaUserAlt, FaSearch, FaHeart,FaCheck, FaComments, FaSignOutAlt, FaMapMarkerAlt, FaCrosshairs } from "react-icons/fa";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { storage, db, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from "../context/auth";


const categories = [
  "Vehicles", "Property", "Electronics", "Home & Garden", "Fashion & Beauty",
  "Jobs", "Services", "Pets", "Sports & Outdoors", "Hobbies & Leisure",
  "Kids & Baby Products", "Business & Industrial", "Health & Wellness",
  "Education", "Travel & Tourism", "Events", "Agriculture & Farming", "Others"
];

const MapPopup = ({ isOpen, onClose, userLocation, onLocationUpdate }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDsjUXVb042Yemnow0qkw45haWyjikqTRw"
  });

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(userLocation);
    map.fitBounds(bounds);
    setMap(map);
    setMarker(userLocation);
  }, [userLocation]);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    updateMarkerAndCenter({ lat, lng });
  };

  const handleConfirm = () => {
    if (marker) {
      onLocationUpdate(marker.lat, marker.lng);
      onClose();
    }
  };

  const updateMarkerAndCenter = (location) => {
    setMarker(location);
    if (map) {
      map.panTo(location);
      map.setZoom(15);
    }
  };

  const handleCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
  
          console.log("Current Location:", currentLocation);
          updateMarkerAndCenter(currentLocation);
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Unable to fetch your location. ";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "User denied the request for Geolocation.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "The request to get user location timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
              break;
          }
          alert(errorMessage);
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && map) {
      const bounds = new window.google.maps.LatLngBounds(userLocation);
      map.fitBounds(bounds);
      setMarker(userLocation);
    }
  }, [isLoaded, map, userLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[80vw] max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Update Your Location</h2>
        {isLoaded ? (
          <div className="relative">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '400px' }}
              center={userLocation}
              zoom={10}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick}
            >
              {marker && <Marker position={marker} />}
            </GoogleMap>
            <button
              onClick={handleCurrentLocation}
              className="absolute bottom-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
              title="Use current location"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <FaCrosshairs className="w-5 h-5 text-blue-600" />
              )}
            </button>
          </div>
        ) : (
          <div>Loading...</div>
        )}
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-500 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const Sell = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [values, setValues] = useState({
    images: [],
    title: "",
    category: "",
    price: "",
    address: "",
    contact: "",
    description: "",
    isNew: true,
    listingType: "sell",
    error: "",
    loading: false,
    lat: "",
    lon: "",
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [locationSaved, setLocationSaved] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);

  const { images, title, category, price, address, contact, description, isNew, listingType, error, loading, lat, lon } = values;

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });

    if (name === "images") {
      const selectedFiles = Array.from(e.target.files);
      setValues({ ...values, images: selectedFiles });

      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }

    setErrors({ ...errors, [name]: "" });
  };

  const handleToggle = () => {
    setValues({ ...values, isNew: !isNew });
  };

  const handleLocationClick = () => {
    setShowMapPopup(true);
  };

  const handleLocationUpdate = (lat, lng) => {
    setValues({
      ...values,
      lat: lat.toString(),
      lon: lng.toString(),
    });
    setLocationSaved(true);
    setTimeout(() => setLocationSaved(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title) newErrors.title = "Title is required";
    if (!category) newErrors.category = "Category is required";
    if (listingType === "sell" && !price) newErrors.price = "Price is required";
    if (!address) newErrors.address = "Address is required";
    if (!contact) newErrors.contact = "Contact is required";
    if (!images.length) newErrors.images = "At least one image is required";
    if (listingType === "sell" && price < 0) newErrors.price = "Price cannot be negative";
    if (!lat || !lon) newErrors.location = "Location is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setValues({ ...values, error: "", loading: true });

    try {
      let imgs = [];
      if (images.length) {
        for (let image of images) {
          const imgRef = ref(storage, `ads/${Date.now()} - ${image.name}`);
          const result = await uploadBytes(imgRef, image);
          const fileUrl = await getDownloadURL(ref(storage, result.ref.fullPath));

          imgs.push({ url: fileUrl, path: result.ref.fullPath });
        }
      }

      const result = await addDoc(collection(db, "ads"), {
        images: imgs,
        title,
        category,
        price: listingType === "sell" ? price : 0,
        address,
        contact,
        description,
        isNew,
        isSold: false,
        listingType,
        adType: listingType,
        publishedAt: Timestamp.fromDate(new Date()),
        postedBy: auth.currentUser.uid,
        lat,
        lon,
      });

      await setDoc(
        doc(db, "ads", result.id),
        {
          adId: result.id,
        },
        {
          merge: true,
        }
      );

      await setDoc(doc(db, 'favorites', result.id), { users: [] });

      setValues({
        images: [],
        title: "",
        category: "",
        price: "",
        address: "",
        contact: "",
        description: "",
        isNew: true,
        listingType: "",
        loading: false,
        lat: "",
        lon: "",
      });
      setImagePreviews([]);
      navigate("/");
    } catch (error) {
      setValues({ ...values, error: error.message, loading: false });
    }
  };

  const showConditionToggle = !["Pets", "Kids & Baby Products", "Health & Wellness", "Others"].includes(category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container py-5"
      style={{ backgroundColor: "rgba(147, 112, 219, 0.1)" }}
    >
      <motion.div
        className="card shadow-lg p-5 rounded-3"
        whileHover={{ boxShadow: "0px 0px 15px rgba(0,0,0,0.1)" }}
        style={{ backgroundColor: "#ffffff" }}
      >
        <h2 className="text-center mb-4" style={{ color: "#2c3e50" }}>Create Your Listing</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          {/* Listing Type Selection */}
          <div className="col-12 mb-4 text-center">
            <label className="form-label fw-bold d-block mb-3" style={{ color: "#34495e", fontSize: "1.25rem" }}>
              I want to:
            </label>
            <div className="d-flex justify-content-center gap-3">
              {["sell", "swap", "donate"].map((type) => (
                <motion.button
                  key={type}
                  type="button"
                  className="btn rounded-pill px-4 py-2"
                  onClick={() => setValues({ ...values, listingType: type })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    backgroundColor: listingType === type ? "#3498db" : "transparent",
                    color: listingType === type ? "#ffffff" : "#3498db",
                    border: `1px solid ${listingType === type ? "#3498db" : "#3498db"}`,
                    minWidth: "120px",
                    transition: "all 0.3s ease"
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Image Upload Section */}
          <motion.div
            className="col-12 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <label 
              htmlFor="image" 
              className="btn rounded-3 p-4 d-inline-flex flex-column align-items-center gap-2"
              style={{ 
                border: "2px dashed #bdc3c7",
                color: "#7f8c8d",
                minWidth: "200px"
              }}
            >
              <PiUploadDuotone size={32} />
              <span>Upload Images</span>
            </label>
            <input
              type="file"
              id="image"
              style={{ display: "none" }}
              accept="image/*"
              multiple
              onChange={handleChange}
              name="images"
              required
            />
            {errors.images && <span className="text-danger d-block mt-2">{errors.images}</span>}
          </motion.div>

          {/* Image Preview Section */}
          <div className="col-12 text-center">
            {imagePreviews.length > 0 && (
              <div className="d-flex justify-content-center flex-wrap mb-3">
                {imagePreviews.map((preview, index) => (
                  <motion.img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="img-thumbnail m-2"
                    style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "contain" }}
                    whileHover={{ scale: 1.1 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <motion.div className="col-md-6" whileHover={{ scale: 1.02 }}>
            <label className="form-label fw-bold" style={{ color: "#34495e" }}>Title {errors.title && <span className="text-danger">* {errors.title}</span>}</label>
            <input
              type="text"
              className={`form-control shadow-sm ${errors.title ? "border-danger" : ""}`}
              name="title"
              value={title}
              onChange={handleChange}
              placeholder="Enter the title of your item"
              required
              style={{ borderColor: "#bdc3c7" }}
            />
          </motion.div>

          {/* Category */}
          <motion.div className="col-md-6" whileHover={{ scale: 1.02 }}>
            <label className="form-label fw-bold" style={{ color: "#34495e" }}>Category {errors.category && <span className="text-danger">* {errors.category}</span>}</label>
            <select
              name="category"
              className={`form-select shadow-sm ${errors.category ? "border-danger" : ""}`}
              onChange={handleChange}
              required
              style={{ borderColor: "#bdc3c7" }}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Price - Only shown for 'sell' listing type */}
          {listingType === "sell" && (
            <motion.div className="col-md-6" whileHover={{ scale: 1.02 }}>
              <label className="form-label fw-bold" style={{ color: "#34495e" }}>Price {errors.price && <span className="text-danger">* {errors.price}</span>}</label>
              <input
                type="number"
                className={`form-control shadow-sm ${errors.price ? "border-danger" : ""}`}
                name="price"
                value={price}
                onChange={handleChange}
                placeholder="Enter price"
                required
                style={{ borderColor: "#bdc3c7" }}
              />
            </motion.div>
          )}

          {/* Location */}
          <motion.div className="col-md-6" whileHover={{ scale: 1.02 }}>
            <label className="form-label fw-bold" style={{ color: "#34495e" }}>Location {errors.location && <span className="text-danger">* {errors.location}</span>}</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Your location"
                value={lat && lon ? `${lat}, ${lon}` : ""}
                readOnly
              />
              <motion.button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleLocationClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                <FaMapMarkerAlt className="me-2" />
                {loading ? "Loading..." : (lat && lon) ? "Update" : "Get Location"}
              </motion.button>
            </div>
            <AnimatePresence>
              {locationSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-success mt-2 d-flex align-items-center"
                >
                  <FaCheck className="me-2" />
                  Location saved
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Contact */}
          <motion.div className="col-md-6" whileHover={{ scale: 1.02 }}>
            <label className="form-label fw-bold" style={{ color: "#34495e" }}>Contact {errors.contact && <span className="text-danger">* {errors.contact}</span>}</label>
            <input
              type="text"
              className={`form-control shadow-sm ${errors.contact ? "border-danger" : ""}`}
              name="contact"
              value={contact}
              onChange={handleChange}
              placeholder="Enter contact information"
              required
              style={{ borderColor: "#bdc3c7" }}
            />
          </motion.div>

          {/* New/Used Switch - Conditionally Rendered */}
          {showConditionToggle && (
            <motion.div className="col-md-6 d-flex align-items-center" whileHover={{ scale: 1.02 }}>
              <label className="form-label fw-bold me-3" style={{ color: "#34495e" }}>Condition:</label>
              <div className="form-check form-switch" onClick={handleToggle} style={{ cursor: "pointer" }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="isNew"
                  checked={isNew}
                  readOnly
                  style={{ backgroundColor: isNew ? "#2ecc71" : "#e74c3c" }}
                />
                <label className="form-check-label" htmlFor="isNew" style={{ color: "#34495e" }}>
                  {isNew ? "New" : "Used"}
                </label>
              </div>
            </motion.div>
          )}

          {/* Address */}
          <motion.div className="col-md-6" whileHover={{ scale: 1.02 }}>
            <label className="form-label fw-bold" style={{ color: "#34495e" }}>Address {errors.address && <span className="text-danger">* {errors.address}</span>}</label>
            <input
              type="text"
              className={`form-control shadow-sm ${errors.address ? "border-danger" : ""}`}
              name="address"
              value={address}
              onChange={handleChange}
              placeholder="Enter the address"
              required
              style={{ borderColor: "#bdc3c7" }}
            />
          </motion.div>

          {/* Description */}
          <motion.div className="col-12" whileHover={{ scale: 1.02 }}>
            <label className="form-label fw-bold" style={{ color: "#34495e" }}>Description</label>
            <textarea
              className="form-control shadow-sm"
              name="description"
              value={description}
              onChange={handleChange}
              placeholder="Describe your item (optional)"
              rows="4"
              style={{ borderColor: "#bdc3c7" }}
            />
          </motion.div>

          {/* Create Listing Button */}
          <div className="col-12 text-center">
            <motion.button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                backgroundColor: "#3498db",
                borderColor: "#3498db",
                color: "#ffffff",
                minWidth: "150px"
              }}
            >
              {loading ? "Creating Listing..." : "Create Listing"}
            </motion.button>
            {error && <p className="text-danger mt-2">{error}</p>}
          </div>
        </form>
      </motion.div>
      <MapPopup
        isOpen={showMapPopup}
        onClose={() => setShowMapPopup(false)}
        userLocation={{ lat: parseFloat(lat) || 23.8103, lng: parseFloat(lon) || 90.4125 }}
        onLocationUpdate={handleLocationUpdate}
      />
    </motion.div>
  );
};

export default Sell;