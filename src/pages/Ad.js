import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebaseConfig";
import { ref, deleteObject } from "firebase/storage";
import { AiOutlineHeart, AiFillHeart, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { FaTrashAlt, FaUserCircle, FaPhoneAlt, FaComments } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import Moment from "react-moment";
import useSnapshot from "../utils/useSnapshot";
import { toggleFavorite } from "../utils/fav";
import Sold from "../components/Sold";

const Ad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState();
  const [idx, setIdx] = useState(0);
  const [seller, setSeller] = useState();
  const [showNumber, setShowNumber] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { val } = useSnapshot("favorites", id);

  const getAd = async () => {
    const docRef = doc(db, "ads", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setAd(docSnap.data());
      const sellerRef = doc(db, "users", docSnap.data().postedBy);
      const sellerSnap = await getDoc(sellerRef);
      if (sellerSnap.exists()) {
        setSeller(sellerSnap.data());
      }
    }
  };

  useEffect(() => {
    getAd();
    setIsFavorite(val?.users?.includes(auth.currentUser?.uid) || false);
  }, [val]);

  const handleFavoriteClick = () => {
    toggleFavorite(val.users, id);
    setIsFavorite(!isFavorite);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const deleteAd = async () => {
    const confirm = window.confirm(`Delete ${ad.title}?`);
    if (confirm) {
      for (const image of ad.images) {
        const imgRef = ref(storage, image.path);
        await deleteObject(imgRef);
      }
      await deleteDoc(doc(db, "favorites", id));
      await deleteDoc(doc(db, "ads", id));
      navigate(`/profile/${auth.currentUser.uid}`);
    }
  };

  const updateStatus = async () => {
    await updateDoc(doc(db, "ads", id), { isSold: true });
    getAd();
  };

  const createChatroom = async () => {
    const loggedInUser = auth.currentUser.uid;
    const chatId =
      loggedInUser > ad.postedBy
        ? `${loggedInUser}.${ad.postedBy}.${id}`
        : `${ad.postedBy}.${loggedInUser}.${id}`;
    
    await setDoc(doc(db, "messages", chatId), {
      ad: id,
      users: [loggedInUser, ad.postedBy],
    });

    navigate("/chat", { state: { ad } });
  };

  return ad ? (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <style jsx>{`
        .image-gallery {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background-color: #f8f8f8;
        }
        .image-gallery img {
          width: 100%;
          height: 500px;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .gallery-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .gallery-nav:hover {
          background-color: rgba(255, 255, 255, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .gallery-nav-left {
          left: 16px;
        }
        .gallery-nav-right {
          right: 16px;
        }
        .ad-details {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 32px;
          margin-top: 24px;
        }
        .seller-info {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 32px;
          margin-top: 24px;
        }
        .favorite-button {
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .favorite-button:hover {
          transform: scale(1.1);
        }
        .animate-heart {
          animation: heartBeat 0.3s ease-in-out;
        }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .action-button {
          transition: all 0.3s ease;
          width: 100%;
        }
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="image-gallery mb-6">
        <img src={ad.images[idx].url} alt={ad.title} />
        <div className="gallery-nav gallery-nav-left" onClick={() => setIdx((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1))}>
          <AiOutlineLeft size={24} />
        </div>
        <div className="gallery-nav gallery-nav-right" onClick={() => setIdx((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1))}>
          <AiOutlineRight size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="ad-details h-full">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{ad.title}</h1>
              <div 
                className={`favorite-button ${isAnimating ? 'animate-heart' : ''}`}
                onClick={handleFavoriteClick}
              >
                {isFavorite ? (
                  <AiFillHeart size={32} className="text-red-500" />
                ) : (
                  <AiOutlineHeart size={32} className="text-gray-400" />
                )}
              </div>
            </div>
            <p className="text-2xl font-semibold text-green-600 mb-4">
              BDT. {Number(ad.price).toLocaleString()}
            </p>
            <p className="text-gray-600 mb-4">{ad.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <p>Condition: <span className="font-semibold">{ad.condition}</span></p>
              <p>{ad.location} - <Moment fromNow>{ad.publishedAt.toDate()}</Moment></p>
            </div>
            {ad.isSold && (
              <div className="mt-4">
                <Sold singleAd={true} />
              </div>
            )}
            {ad.postedBy === auth.currentUser?.uid && (
              <button
                className="mt-4 flex items-center text-red-500 hover:text-red-700 transition-colors duration-300"
                onClick={deleteAd}
              >
                <FaTrashAlt className="mr-2" /> Delete Ad
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="seller-info h-full">
            <h2 className="text-2xl font-semibold mb-4">Seller Information</h2>
            <Link to={`/profile/${ad.postedBy}`} className="flex items-center mb-4 hover:bg-gray-100 p-2 rounded transition-colors duration-300">
              {seller?.photoUrl ? (
                <img src={seller.photoUrl} alt={seller.name} className="w-12 h-12 rounded-full mr-4" />
              ) : (
                <FaUserCircle size={48} className="mr-4 text-gray-400" />
              )}
              <span className="text-lg font-medium text-gray-800">{seller?.name}</span>
            </Link>
            {auth.currentUser ? (
              <div className="space-y-3">
                {showNumber ? (
                  <p className="flex items-center text-gray-600 bg-gray-100 p-3 rounded">
                    <FiPhoneCall size={20} className="mr-2" /> {ad.contact}
                  </p>
                ) : (
                  <button
                    className="action-button bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                    onClick={() => setShowNumber(true)}
                  >
                    <FaPhoneAlt size={16} className="mr-2" /> Show Contact Info
                  </button>
                )}
                {ad.postedBy !== auth.currentUser?.uid && (
                  <button
                    className="action-button bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                    onClick={createChatroom}
                  >
                    <FaComments size={16} className="mr-2" /> Chat with Seller
                  </button>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-600 bg-gray-100 p-4 rounded">
                Please <Link to="/login" className="text-blue-500 hover:underline">login</Link> to view contact info.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Ad;