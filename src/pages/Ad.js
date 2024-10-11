import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebaseConfig";
import { ref, deleteObject } from "firebase/storage";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import {
  FaTrashAlt,
  FaUserCircle,
  FaPhoneAlt,
  FaComments,
} from "react-icons/fa";
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
  }, []);

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
    await updateDoc(doc(db, "ads", id), {
      isSold: true,
    });
    getAd();
  };

  return ad ? (
    <div className="container mx-auto mt-5 h-[1500px]">
      {/* Fullscreen Image Carousel */}
      <div className="relative mb-4 mb-[200px] ">
        {ad.isSold && <Sold singleAd={true} />}
        <div className="relative overflow-hidden h-64 md:h-96 flex justify-center items-center">
          {ad.images.map((image, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                idx === i ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image.url}
                alt={ad.title}
                className="w-[50%] h-full object-cover rounded-lg mx-auto"
              />
            </div>
          ))}
          <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 text-white bg-lavender rounded-full p-2"
            onClick={() =>
              setIdx((idx - 1 + ad.images.length) % ad.images.length)
            }
          >
            &#10094;
          </button>
          <button
            className="absolute top-1/2 right-0 transform -translate-y-1/2 text-white bg-lavender rounded-full p-2"
            onClick={() => setIdx((idx + 1) % ad.images.length)}
          >
            &#10095;
          </button>
        </div>
      </div>

      {/* Listing Details and Seller Info */}
      <div className="grid grid-cols-1 relative gap-8 ">
        {/* Listing Information Card */}
        <div className="bg-white p-6 w-[70%]  mx-auto  rounded-lg ">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              BDT. {Number(ad.price).toLocaleString()}
            </h2>
            {val?.users?.includes(auth.currentUser?.uid) ? (
              <AiFillStar
                size={30}
                onClick={() => toggleFavorite(val.users, id)}
                className="text-yellow-400 cursor-pointer"
              />
            ) : (
              <AiOutlineStar
                size={30}
                onClick={() => toggleFavorite(val?.users || [], id)}
                className="text-gray-400 cursor-pointer"
              />
            )}
          </div>
          <h3 className="text-lg font-medium my-2">{ad.title}</h3>
          <p className="text-gray-600 mb-4">{ad.description}</p>

          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{ad.location}</span>
            <Moment fromNow>{ad.publishedAt.toDate()}</Moment>
          </div>
          {ad.postedBy === auth.currentUser?.uid && (
            <FaTrashAlt
              className="text-red-500 cursor-pointer mt-4"
              onClick={deleteAd}
            />
          )}
        </div>

        {/* Seller Information Card */}
        <div className="absolute right-40 top-100 bg-white p-6 w-[30%] shadow-lg mb-100 flex rounded-lg">
          <div>
            <h3 className="text-xl font-medium">Seller Information</h3>
            <Link to={`/profile/${ad.postedBy}`}>
              <div className="flex items-center mt-4">
                {seller?.photoUrl ? (
                  <img
                    src={seller.photoUrl}
                    alt={seller.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                ) : (
                  <FaUserCircle size={48} className="text-gray-400" />
                )}
                <span className="text-lg font-medium">{seller?.name}</span>
              </div>
            </Link>
          </div>
          <div className="mt-6 text-center">
            {auth.currentUser ? (
              <>
                {showNumber ? (
                  <p className="text-lg font-bold">
                    <FaPhoneAlt className="inline mr-2" /> {ad.contact}
                  </p>
                ) : (
                  <button
                    className="mt-4 w-full inline-block text-center text-white bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-indigo-500 hover:to-purple-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm px-4 py-2 transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl"
                    onClick={() => setShowNumber(true)}
                  >
                    Show Contact Info
                  </button>
                )}
                <br />
                {ad.postedBy !== auth.currentUser?.uid && (
                  <button className="mt-4 w-full inline-block text-center text-white bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-indigo-500 hover:to-purple-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm px-4 py-2 transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Chat with Seller
                  </button>
                )}
              </>
            ) : (
              <p>
                Please{" "}
                <Link to="/login" className="text-blue-500 underline">
                  login
                </Link>{" "}
                to view contact info.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Ad;
