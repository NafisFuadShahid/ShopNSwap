import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage, auth } from "../firebaseConfig";
import { FaUserAlt, FaCloudUploadAlt, FaEdit, FaTrash, FaShoppingBag, FaExchangeAlt, FaHandHoldingHeart } from "react-icons/fa";
import moment from "moment";
import AdCard from "../components/AdCard";
import useSnapshot from "../utils/useSnapshot";
import ProfileAnimation from "../components/ProfileAnimation";
import { toast } from 'react-toastify';

const monthAndYear = (date) =>
  `${moment(date).format("MMMM").slice(0, 3)} ${moment(date).format("YYYY")}`;

const Profile = () => {
  const { id } = useParams();
  const userId = id || (auth.currentUser ? auth.currentUser.uid : null);
  const [img, setImg] = useState("");
  const [ads, setAds] = useState({ sell: [], swap: [], donate: [] });
  const [newName, setNewName] = useState("");
  const [previewImg, setPreviewImg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { val: user } = useSnapshot("users", userId);

  const uploadImage = async () => {
    if (!img || !auth.currentUser) return;
    const imgRef = ref(storage, `profile/${Date.now()} - ${img.name}`);
    if (user?.photoUrl) {
      try {
        await deleteObject(ref(storage, user.photoPath));
      } catch (error) {
        console.error("Error deleting old photo:", error);
      }
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
    if (!userId) return;
    
    try {
      const adsRef = collection(db, "ads");
      const q = query(
        adsRef,
        where("postedBy", "==", userId),
        orderBy("publishedAt", "desc")
      );
      const docs = await getDocs(q);
      const fetchedAds = { sell: [], swap: [], donate: [] };
      
      docs.docs.forEach(doc => {
        const data = doc.data();
        const ad = { ...data, id: doc.id };
        const adType = (ad.adType || '').toLowerCase();
        if (fetchedAds[adType]) {
          fetchedAds[adType].push(ad);
        }
      });
      
      setAds(fetchedAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
  };

  const deletePhoto = async () => {
    if (!user?.photoPath || !auth.currentUser) return;

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
    if (!auth.currentUser) return;
    
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

  const getFilteredAds = () => {
    if (activeTab === 'all') {
      return [...ads.sell, ...ads.swap, ...ads.donate];
    }
    return ads[activeTab] || [];
  };

  const isOwnProfile = auth.currentUser && (!id || id === auth.currentUser.uid);

  const tabs = [
    { id: 'all', label: 'All Items', icon: FaShoppingBag, color: 'from-primary-500 to-purple-600' },
    { id: 'sell', label: 'Shop', icon: FaShoppingBag, color: 'from-blue-500 to-cyan-600' },
    { id: 'swap', label: 'Swap', icon: FaExchangeAlt, color: 'from-purple-500 to-pink-600' },
    { id: 'donate', label: 'Donate', icon: FaHandHoldingHeart, color: 'from-pink-500 to-rose-600' },
  ];

  const deleteAd = async (ad) => {
    if (!window.confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete the ad document from Firestore
      await deleteDoc(doc(db, "ads", ad.id));

      // Delete all images associated with the ad from Storage
      if (ad.images && ad.images.length > 0) {
        for (const imagePath of ad.imagePaths) {
          try {
            const imageRef = ref(storage, imagePath);
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        }
      }

      // Update the local state to remove the deleted ad
      setAds(prevAds => ({
        sell: prevAds.sell.filter(item => item.id !== ad.id),
        swap: prevAds.swap.filter(item => item.id !== ad.id),
        donate: prevAds.donate.filter(item => item.id !== ad.id)
      }));

      toast.success('Ad deleted successfully!');
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error('Failed to delete ad. Please try again.');
    }
  };

  useEffect(() => {
    if (userId) {
      getAds();
    }
  }, [userId]);

  useEffect(() => {
    if (img) {
      uploadImage();
    }
  }, [img]);

  if (!user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <ProfileAnimation />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ProfileAnimation />
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden mb-8"
          >
            <div className="p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="mb-6 sm:mb-0 sm:mr-12"
                >
                  <div className="relative group">
                    {previewImg || user.photoUrl ? (
                      <img
                        src={previewImg || user.photoUrl}
                        alt={user.name}
                        className="w-48 h-48 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300"
                      />
                    ) : (
                      <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <FaUserAlt size={72} className="text-gray-400" />
                      </div>
                    )}
                    {isOwnProfile && (
                      <label
                        htmlFor="photo"
                        className="absolute bottom-2 right-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl p-3 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
                      >
                        <FaCloudUploadAlt size={24} />
                      </label>
                    )}
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </motion.div>

                <div className="text-center sm:text-left flex-grow">
                  {isEditing ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4"
                    >
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New name"
                        className="w-full px-4 py-3 text-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/80 backdrop-blur-sm"
                      />
                      <div className="mt-4 flex justify-end space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={updateName}
                          className="px-6 py-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition duration-300"
                        >
                          Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 text-transparent bg-clip-text">
                        {user.name}
                        {isOwnProfile && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsEditing(true)}
                            className="ml-3 text-primary-500 hover:text-primary-600"
                          >
                            <FaEdit size={24} />
                          </motion.button>
                        )}
                      </h2>
                      <p className="text-xl text-gray-600 mb-6">
                        Member since {monthAndYear(user.createdAt.toDate())}
                      </p>
                      {user.photoUrl && isOwnProfile && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={deletePhoto}
                          className="text-red-500 hover:text-red-600 transition duration-300 text-lg"
                        >
                          <FaTrash size={20} className="mr-2 inline-block" />
                          Remove Photo
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex justify-center space-x-4">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2
                    ${activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'bg-white/80 text-gray-600 hover:bg-white shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <h3 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              {getFilteredAds().length ? "My Products" : "No products listed yet"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {getFilteredAds().map((ad) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="relative">
                    <AdCard ad={ad} />
                    {isOwnProfile && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteAd(ad)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-300 z-10"
                      >
                        <FaTrash size={16} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;