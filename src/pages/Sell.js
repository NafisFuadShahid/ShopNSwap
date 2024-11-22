import React, { useState, useCallback, useEffect, useContext } from "react";
import { PiUploadDuotone } from "react-icons/pi";
import { FaUserAlt, FaSearch, FaHeart, FaCheck, FaComments, FaSignOutAlt, FaMapMarkerAlt, FaCrosshairs, FaTag, FaList, FaDollarSign, FaPhone, FaInfoCircle, FaTrash, FaExchangeAlt, FaHandHoldingHeart } from "react-icons/fa";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { addDoc, collection, doc, setDoc, Timestamp, GeoPoint } from "firebase/firestore";
import { storage, db, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AuthContext } from "../context/auth";
import BackgroundAnimation from "../components/BackgroundAnimation";
import { getCurrentLocation } from '../utils/location';

// Fix Leaflet's default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const categories = [
  "Vehicles", "Property", "Electronics", "Home & Garden", "Fashion & Beauty",
  "Jobs", "Services", "Pets", "Sports & Outdoors", "Hobbies & Leisure",
  "Kids & Baby Products", "Business & Industrial", "Health & Wellness",
  "Education", "Travel & Tourism", "Events", "Agriculture & Farming", "Others"
];

const libraries = [];

const MapPopup = ({ isOpen, onClose, userLocation, onLocationUpdate }) => {
  const [position, setPosition] = useState(userLocation || [23.8103, 90.4125]); // Default to Dhaka if no location
  const [locationName, setLocationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        map.flyTo(e.latlng, map.getZoom());
        fetchLocationName(e.latlng.lat, e.latlng.lng);
      },
    });

    return position ? (
      <Marker position={position}>
      </Marker>
    ) : null;
  };

  const fetchLocationName = async (lat, lng) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.display_name) {
        const locationString = data.display_name;
        setLocationName(locationString);
        return locationString;
      }
      throw new Error('Location not found');
    } catch (error) {
      console.error("Error fetching location name:", error);
      return "Unknown location";
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (position) {
      const name = locationName || await fetchLocationName(position[0], position[1]);
      onLocationUpdate(position[0], position[1], name);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Select Location</h3>
        </div>
        
        <div className="p-4">
          <div className="h-[400px] w-full rounded-lg overflow-hidden mb-4">
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker />
            </MapContainer>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              {isLoading ? "Loading location..." : locationName || "Click on the map to select location"}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!position || isLoading}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors disabled:bg-primary-300"
          >
            Confirm Location
          </button>
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
    swapPreferences: "",
    error: "",
    loading: false,
    lat: "",
    lon: "",
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [locationSaved, setLocationSaved] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // Get user's location when component mounts
    if (values.listingType === 'swap') {
      getCurrentLocation()
        .then(loc => {
          setLocation(loc);
          setLocationError(null);
        })
        .catch(error => {
          setLocationError('Location access is required for swap listings. Please enable location access and try again.');
          console.error('Error getting location:', error);
        });
    }
  }, [values.listingType]);

  const { images, title, category, price, address, contact, description, isNew, listingType, swapPreferences, error, loading, lat, lon } = values;

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxImages = 5;
    const remainingSlots = maxImages - values.images.length;
    
    if (selectedFiles.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}`);
      return;
    }

    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValidType) {
        alert(`File "${file.name}" is not an image`);
      }
      if (!isValidSize) {
        alert(`File "${file.name}" exceeds 5MB limit`);
      }
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Append new files to existing ones
    const newImages = [...values.images, ...validFiles];
    
    // Create preview URLs for all images
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    
    setImagePreviews(prevPreviews => {
      // Revoke old preview URLs to prevent memory leaks
      prevPreviews.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
    
    setValues({ ...values, images: newImages });
    setSelectedImageIndex(newImages.length - 1);
  };

  const removeImage = (index) => {
    const newImages = [...values.images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setValues({ ...values, images: newImages });
    setImagePreviews(newPreviews);
    setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
  };

  const handleLocationUpdate = async (lat, lng, locationName) => {
    setValues({
      ...values,
      lat: lat.toString(),
      lon: lng.toString(),
      address: locationName,
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
    if (listingType === 'swap' && !location) {
      newErrors.location = 'Location access is required for swap listings';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setValues({ ...values, error: "", loading: true });

    try {
      const imageUrls = [];
      const imagePaths = [];

      // Upload each image
      for (const image of images) {
        const path = `ads/${Date.now()}-${image.name}`;
        const imageRef = ref(storage, path);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push({ url, path });
        imagePaths.push(path);
      }

      const adData = {
        title,
        category,
        price: listingType === "sell" ? parseFloat(price) : 0,
        address,
        contact,
        description,
        isNew,
        adType: listingType,
        swapPreferences,
        images: imageUrls,
        imagePaths,
        postedBy: user.uid,
        publishedAt: Timestamp.fromDate(new Date()),
        location: new GeoPoint(parseFloat(lat), parseFloat(lon))
      };

      if (listingType === 'swap') {
        adData.location = {
          latitude: location.latitude,
          longitude: location.longitude
        }
      }

      await addDoc(collection(db, "ads"), adData);
      navigate("/");
    } catch (err) {
      console.error(err);
      setValues({
        ...values,
        error: err.message,
        loading: false,
      });
    }
  };

  const handleLocationClick = () => {
    setShowMapPopup(true);
  };

  const handleToggle = () => {
    setValues({ ...values, isNew: !isNew });
  };

  const showConditionToggle = !["Pets", "Kids & Baby Products", "Health & Wellness", "Others"].includes(category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <BackgroundAnimation />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 text-transparent bg-clip-text">
              Create Your Listing
            </h2>
            <p className="text-gray-600 mt-2">Share your items with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-700">
                Images <span className="text-red-500">*</span>
              </label>
              
              {/* Image Preview Grid */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === selectedImageIndex 
                        ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-2' 
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
                
                {/* Upload Button */}
                {imagePreviews.length < 5 && (
                  <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <PiUploadDuotone className="mx-auto h-12 w-12 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-600">
                        Add Images
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      max="5"
                    />
                  </label>
                )}
              </div>
              
              {/* Large Preview */}
              {imagePreviews.length > 0 && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imagePreviews[selectedImageIndex]}
                    alt="Selected preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
              )}
            </div>

            {/* Listing Type Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Listing Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setValues({ ...values, listingType: 'sell' })}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                    listingType === 'sell'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaDollarSign />
                    <span>Sell</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setValues({ ...values, listingType: 'swap' })}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                    listingType === 'swap'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaExchangeAlt />
                    <span>Swap</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setValues({ ...values, listingType: 'donate' })}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                    listingType === 'donate'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaHandHoldingHeart />
                    <span>Donate</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaTag className="w-4 h-4 mr-2" />
                Title
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaList className="w-4 h-4 mr-2" />
                Category
              </label>
              <select
                name="category"
                value={category}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Price Field - Only show for Sell listings */}
            {listingType === 'sell' && (
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <FaDollarSign />
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={price}
                    onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="Enter price"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>
            )}

            {/* Swap Preferences - Only show for Swap listings */}
            {listingType === 'swap' && (
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  What would you like to swap for?
                </label>
                <textarea
                  name="swapPreferences"
                  value={swapPreferences}
                  onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="Describe what items you're interested in swapping for..."
                  rows="3"
                />
              </div>
            )}

            {/* Location */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={address}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                  placeholder="Click to set location"
                  onClick={handleLocationClick}
                />
                <button
                  type="button"
                  onClick={handleLocationClick}
                  className="absolute right-2 top-2 text-gray-500 hover:text-primary-500"
                >
                  <FaMapMarkerAlt className="w-5 h-5" />
                </button>
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
              {locationSaved && (
                <p className="text-green-500 text-sm mt-1">
                  Location saved successfully!
                </p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="w-4 h-4 mr-2" />
                Contact Number
              </label>
              <input
                type="tel"
                name="contact"
                value={contact}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter contact number"
              />
              {errors.contact && (
                <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaInfoCircle className="w-4 h-4 mr-2" />
                Description
              </label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe your item..."
              />
            </div>

            {/* Condition Toggle */}
            {showConditionToggle && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <span className="mr-2">Condition:</span>
                  <button
                    type="button"
                    onClick={handleToggle}
                    className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                      transition-colors duration-200 ease-in-out focus:outline-none
                      ${isNew ? 'bg-primary-500' : 'bg-gray-200'}
                    `}
                  >
                    <span
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                        ring-0 transition duration-200 ease-in-out
                        ${isNew ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                  <span className="ml-2">{isNew ? "New" : "Used"}</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative w-full sm:w-auto px-8 py-3 rounded-full font-medium text-white
                  ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-primary-500 to-purple-600'}
                  transition-all duration-200 flex items-center justify-center space-x-2
                  before:absolute before:inset-0 before:rounded-full before:bg-black/10 
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity
                `}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-5 h-5" />
                      <span>Create Listing</span>
                    </>
                  )}
                </span>
              </motion.button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-red-500 mt-4 bg-red-50 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}
            {locationError && listingType === 'swap' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {locationError}
              </div>
            )}
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showMapPopup && (
          <MapPopup
            isOpen={showMapPopup}
            onClose={() => setShowMapPopup(false)}
            userLocation={{ lat: 23.8103, lng: 90.4125 }}
            onLocationUpdate={handleLocationUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sell;