import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { storage, db, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const categories = ["Vehicle", "Property", "Electronics"];
const locations = ["Uttara", "Gazipur", "Dhanmondi"];

const Sell = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    images: [],
    title: "",
    category: "",
    price: "",
    location: "",
    contact: "",
    description: "",
    error: "",
    loading: false,
  });
  const {
    images,
    title,
    category,
    price,
    location,
    contact,
    description,
    error,
    loading,
  } = values;

  const handleChange = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setValues({ ...values, error: "", loading: true });

    try {
      let imgs = [];
      // loop through images
      if (images.length) {
        for (let image of images) {
          const imgRef = ref(storage, `ads/${Date.now()} - ${image.name}`);
          const result = await uploadBytes(imgRef, image);
          const fileUrl = await getDownloadURL(
            ref(storage, result.ref.fullPath)
          );

          imgs.push({ url: fileUrl, path: result.ref.fullPath });
        }
      }
      // add data into firestore
      await addDoc(collection(db, "ads"), {
        images: imgs,
        title,
        category,
        price,
        location,
        contact,
        description,
        isSold: false,
        publishedAt: Timestamp.fromDate(new Date()),
        postedBy: auth.currentUser.uid,
      });

      setValues({
        images: [],
        title: "",
        category: "",
        price: "",
        location: "",
        contact: "",
        description,
        loading: false,
      });
      navigate("/");
    } catch (error) {
      setValues({ ...values, error: error.message, loading: false });
    }
  };
  return (
    <form className="form shadow rounded p-3 mt-5" onSubmit={handleSubmit}>
      <h3 className="text-center mb-3">Create An Ad</h3>
      <div className="mb-3 text-center">
        <label htmlFor="image">
          <div className="btn btn-secondary btn-sm">
            <FaCloudUploadAlt size={30} /> Upload Image
          </div>
        </label>
        <input
          type="file"
          id="image"
          style={{ display: "none" }}
          accept="image/*"
          multiple
          onChange={(e) => setValues({ ...values, images: e.target.files })}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          name="title"
          value={title}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <select name="category" className="form-select" onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Price</label>
        <input
          type="number"
          className="form-control"
          name="price"
          value={price}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <select name="location" className="form-select" onChange={handleChange}>
          <option value="">Select Location</option>
          {locations.map((location) => (
            <option value={location} key={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Contact</label>
        <input
          type="text"
          className="form-control"
          name="contact"
          value={contact}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          cols="30"
          rows="3"
          className="form-control"
          value={description}
          onChange={handleChange}
        ></textarea>
      </div>
      {error ? <p className="text-center text-danger">{error}</p> : null}
      <div className="mb-3 text-center">
        <button className="btn btn-secondary btn-sm" disabled={loading}>
          Create
        </button>
      </div>
    </form>
  );
};

export default Sell;
