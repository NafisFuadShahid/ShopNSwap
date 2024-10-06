import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage, auth } from "../firebaseConfig";
import { FaUserAlt, FaCloudUploadAlt } from "react-icons/fa";
import moment from "moment";
import AdCard from "../components/AdCard";
import useSnapshot from "../utils/useSnapshot";

const monthAndYear = (date) =>
  `${moment(date).format("MMMM").slice(0, 3)} ${moment(date).format("YYYY")}`;

const Profile = () => {
  const { id } = useParams();

  const [img, setImg] = useState("");
  const [ads, setAds] = useState([]);
  const [newName, setNewName] = useState(""); // New state for user name

  const { val: user } = useSnapshot("users", id);


  // Upload user image
  const uploadImage = async () => {
    const imgRef = ref(storage, `profile/${Date.now()} - ${img.name}`);
    if (user.photoUrl) {
      await deleteObject(ref(storage, user.photoPath));
    }
    const result = await uploadBytes(imgRef, img);
    const url = await getDownloadURL(ref(storage, result.ref.fullPath));
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      photoUrl: url,
      photoPath: result.ref.fullPath,
    });

    console.log("Image uploaded:", url); // Debugging line
    setImg("");
  };

  // Fetch user ads
  const getAds = async () => {
    const adsRef = collection(db, "ads");
    const q = query(
      adsRef,
      where("postedBy", "==", id),
      orderBy("publishedAt", "desc")
    );
    const docs = await getDocs(q);
    let ads = [];
    docs.forEach((doc) => {
      ads.push({ ...doc.data(), id: doc.id });
    });
    setAds(ads);
  };

  // Handle image upload and deletion
  const deletePhoto = async () => {
    if (!user.photoPath) {
      console.warn("No photo path available for deletion.");
      return; // Exit if there's no photo path
    }
  
    const confirm = window.confirm("Delete photo permanently?");
    if (confirm) {
      try {
        // Delete the photo from storage
        await deleteObject(ref(storage, user.photoPath));
        // Update user document in Firestore
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          photoUrl: "",
          photoPath: "",
        });
  
        // Since you are using useSnapshot, the user state will be updated automatically
        console.log("Photo deleted successfully.");
      } catch (error) {
        console.error("Error deleting photo: ", error);
        alert("There was an error deleting the photo.");
      }
    }
  };

  // Handle name update
  const updateName = async () => {
    if (newName.trim() === "") {
      alert("Name cannot be empty.");
      return;
    }

    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      name: newName,
    });
    setNewName(""); // Clear the input after updating
  };

  useEffect(() => {
    // getUser();
    getAds();
    if (img) {
      uploadImage();
    }
  }, [img]);

  // Debugging: Log the user state
  console.log("User state:", user); 

  return user ? (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="profile-card shadow p-4 rounded">
            <div className="profile-image mb-3">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="rounded-circle"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    border: "2px solid #007bff",
                  }}
                />
              ) : (
                <>
                  {console.log("No photoUrl found, using default icon.")}
                  <FaUserAlt size={80} className="text-secondary" />
                </>
              )}
            </div>
            <h3 className="fw-bold">{user.name}</h3>
            <p className="text-muted">Member since {monthAndYear(user.createdAt.toDate())}</p>

            <div className="dropdown my-3">
              <button
                className="btn btn-outline-primary btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Edit Profile
              </button>
              <ul className="dropdown-menu">
                <li>
                  <label htmlFor="photo" className="dropdown-item">
                    <FaCloudUploadAlt size={20} /> Upload Photo
                  </label>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setImg(e.target.files[0])}
                  />
                </li>
                {user.photoUrl && (
                  <li className="dropdown-item text-danger" onClick={deletePhoto}>
                    Remove Photo
                  </li>
                )}
                <li>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New name"
                    className="form-control my-2"
                  />
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={updateName}
                  >
                    Update Name
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-8 mt-4 text-start">
          <h4 className="fw-bold">Profile Details</h4>
          <hr />
          {ads.length ? (
            <h4 className="fw-bold">Products</h4>
          ) : (
            <h4>There are no ads published by this user</h4>
          )}
          <div className="row">
            {ads.map((ad) => (
              <div key={ad.id} className="col-sm-6 col-md-4 mb-3">
                <AdCard ad={ad} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Profile;
