import React, { useState } from "react";
import { PiUploadDuotone } from "react-icons/pi";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { storage, db, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  "Vehicles", "Property", "Electronics", "Home & Garden", "Fashion & Beauty",
  "Jobs", "Services", "Pets", "Sports & Outdoors", "Hobbies & Leisure",
  "Kids & Baby Products", "Business & Industrial", "Health & Wellness",
  "Education", "Travel & Tourism", "Events", "Agriculture & Farming", "Others"
];

const locations = ["Uttara", "Gazipur", "Mirpur"];

const Sell = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    images: [],
    title: "",
    category: "",
    price: "",
    location: "",
    address: "",
    contact: "",
    description: "",
    isNew: true,
    listingType: "sell",
    error: "",
    loading: false,
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const { images, title, category, price, location, address, contact, description, isNew, listingType, error, loading } = values;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title) newErrors.title = "Title is required";
    if (!category) newErrors.category = "Category is required";
    if (listingType === "sell" && !price) newErrors.price = "Price is required";
    if (!location) newErrors.location = "Location is required";
    if (!address) newErrors.address = "Address is required";
    if (!contact) newErrors.contact = "Contact is required";
    if (!images.length) newErrors.images = "At least one image is required";
    if (listingType === "sell" && price < 0) newErrors.price = "Price cannot be negative";

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
        location,
        address,
        contact,
        description,
        isNew,
        isSold: false,
        listingType,
        publishedAt: Timestamp.fromDate(new Date()),
        postedBy: auth.currentUser.uid,
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
        location: "",
        address: "",
        contact: "",
        description: "",
        isNew: true,
        listingType: "sell",
        loading: false,
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
            <select
              name="location"
              className={`form-select shadow-sm ${errors.location ? "border-danger" : ""}`}
              onChange={handleChange}
              required
              style={{ borderColor: "#bdc3c7" }}
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option value={location} key={location}>
                  {location}
                </option>
              ))}
            </select>
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
    </motion.div>
  );
};

export default Sell;