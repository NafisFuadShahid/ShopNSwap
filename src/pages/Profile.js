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
import { FaUserAlt, FaCloudUploadAlt, FaEdit, FaTrash } from "react-icons/fa";
import moment from "moment";
import AdCard from "../components/AdCard";
import useSnapshot from "../utils/useSnapshot";

const monthAndYear = (date) =>
  `${moment(date).format("MMMM").slice(0, 3)} ${moment(date).format("YYYY")}`;

const Profile = () => {
  const { id } = useParams();
  const [img, setImg] = useState("");
  const [ads, setAds] = useState([]);
  const [newName, setNewName] = useState("");
  const [previewImg, setPreviewImg] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { val: user } = useSnapshot("users", id);

  const uploadImage = async () => {
    if (!img) return;
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
    setImg("");
    setPreviewImg("");
  };

  const getAds = async () => {
    const adsRef = collection(db, "ads");
    const q = query(
      adsRef,
      where("postedBy", "==", id),
      orderBy("publishedAt", "desc")
    );
    const docs = await getDocs(q);
    const adsList = docs.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setAds(adsList);
  };

  const deletePhoto = async () => {
    if (!user.photoPath) return;

    const confirm = window.confirm("Delete photo permanently?");
    if (confirm) {
      try {
        await deleteObject(ref(storage, user.photoPath));
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          photoUrl: "",
          photoPath: "",
        });
      } catch (error) {
        console.error("Error deleting photo: ", error);
        alert("There was an error deleting the photo.");
      }
    }
  };

  const updateName = async () => {
    if (newName.trim() === "") {
      alert("Name cannot be empty.");
      return;
    }

    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      name: newName,
    });
    setNewName("");
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    getAds();
    if (img) {
      uploadImage();
    }
  }, [img]);

  return user ? (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="mb-6 sm:mb-0 sm:mr-10">
                <div className="relative">
                  {previewImg || user.photoUrl ? (
                    <img
                      src={previewImg || user.photoUrl}
                      alt={user.name}
                      className="w-48 h-48 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaUserAlt size={72} className="text-gray-400" />
                    </div>
                  )}
                  <label htmlFor="photo" className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-3 cursor-pointer hover:bg-blue-600 transition duration-300">
                    <FaCloudUploadAlt size={24} />
                  </label>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <div className="text-center sm:text-left flex-grow">
                {isEditing ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="New name"
                      className="w-full px-4 py-2 text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        onClick={updateName}
                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <h2 className="text-4xl font-bold mb-4">
                    {user.name}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="ml-3 text-blue-500 hover:text-blue-600"
                    >
                      <FaEdit size={24} />
                    </button>
                  </h2>
                )}
                <p className="text-xl text-gray-600 mb-6">
                  Member since {monthAndYear(user.createdAt.toDate())}
                </p>
                {user.photoUrl && (
                  <button
                    onClick={deletePhoto}
                    className="text-red-500 hover:text-red-600 transition duration-300 text-lg"
                  >
                    <FaTrash size={20} className="mr-2 inline-block" />
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-3xl font-bold mb-8">
            {ads.length ? "Products" : "No products listed yet"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Profile;