import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { storage, db, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

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
    error: "",
    loading: false,
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});  // Tracks which fields are missing

  const { images, title, category, price, location, address, contact, description, error, loading } = values;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });

    if (name === "images") {
      const selectedFiles = Array.from(e.target.files);
      setValues({ ...values, images: selectedFiles });

      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }

    // Clear field-specific errors when the user types in that field
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title) newErrors.title = "Title is required";
    if (!category) newErrors.category = "Category is required";
    if (!price) newErrors.price = "Price is required";
    if (!location) newErrors.location = "Location is required";
    if (!address) newErrors.address = "Address is required";
    if (!contact) newErrors.contact = "Contact is required";

    // If there are errors, stop the form submission
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
        price,
        location,
        address,
        contact,
        description,
        isSold: false,
        publishedAt: Timestamp.fromDate(new Date()),
        postedBy: auth.currentUser.uid,
      });

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
        loading: false,
      });
      setImagePreviews([]);
      navigate("/");
    } catch (error) {
      setValues({ ...values, error: error.message, loading: false });
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg p-5 rounded-3">
        <h2 className="text-center mb-4">Create Your Ad</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          {/* Image Upload Section */}
          <div className="col-12 text-center">
            <label htmlFor="image" className="btn btn-outline-secondary">
              <FaCloudUploadAlt size={24} className="me-2" />
              Upload Images
            </label>
            <input
              type="file"
              id="image"
              style={{ display: "none" }}
              accept="image/*"
              multiple
              onChange={handleChange}
              name="images"
            />
          </div>

          {/* Image Preview Section */}
          <div className="col-12 text-center">
            {imagePreviews.length > 0 && (
              <div className="d-flex justify-content-center flex-wrap mb-3">
                {imagePreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="img-thumbnail m-2"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="col-md-6">
            <label className="form-label fw-bold">Title {errors.title && <span className="text-danger">* {errors.title}</span>}</label>
            <input
              type="text"
              className={`form-control ${errors.title ? "border-danger" : ""}`}
              name="title"
              value={title}
              onChange={handleChange}
              placeholder="Enter the title of your product"
              required
            />
          </div>

          {/* Category */}
          <div className="col-md-6">
            <label className="form-label fw-bold">Category {errors.category && <span className="text-danger">* {errors.category}</span>}</label>
            <select
              name="category"
              className={`form-select ${errors.category ? "border-danger" : ""}`}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="col-md-6">
            <label className="form-label fw-bold">Price {errors.price && <span className="text-danger">* {errors.price}</span>}</label>
            <input
              type="number"
              className={`form-control ${errors.price ? "border-danger" : ""}`}
              name="price"
              value={price}
              onChange={handleChange}
              placeholder="Enter price"
              required
            />
          </div>

          {/* Location */}
          <div className="col-md-6">
            <label className="form-label fw-bold">Location {errors.location && <span className="text-danger">* {errors.location}</span>}</label>
            <select
              name="location"
              className={`form-select ${errors.location ? "border-danger" : ""}`}
              onChange={handleChange}
              required
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option value={location} key={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="col-md-12">
            <label className="form-label fw-bold">Address {errors.address && <span className="text-danger">* {errors.address}</span>}</label>
            <input
              type="text"
              className={`form-control ${errors.address ? "border-danger" : ""}`}
              name="address"
              value={address}
              onChange={handleChange}
              placeholder="Enter address"
              required
            />
          </div>

          {/* Contact */}
          <div className="col-md-12">
            <label className="form-label fw-bold">Contact {errors.contact && <span className="text-danger">* {errors.contact}</span>}</label>
            <input
              type="text"
              className={`form-control ${errors.contact ? "border-danger" : ""}`}
              name="contact"
              value={contact}
              onChange={handleChange}
              placeholder="Enter contact information"
              required
            />
          </div>

          {/* Description */}
          <div className="col-md-12">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={description}
              onChange={handleChange}
              placeholder="Enter a description for your product"
              rows="3"
            ></textarea>
          </div>

          {/* Error Message */}
          {error && <p className="text-center text-danger">{error}</p>}

          {/* Submit Button */}
          <div className="col-12 text-center">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Ad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sell;
