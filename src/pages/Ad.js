import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebaseConfig";
import { ref, deleteObject } from "firebase/storage";
import { AiOutlineHeart, AiFillHeart, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FaTrashAlt, FaUserCircle, FaPhoneAlt, FaComments } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import Moment from "react-moment";
import useSnapshot from "../utils/useSnapshot";
import { toggleFavorite } from "../utils/fav";
import Sold from "../components/Sold";

const Ad = () => {
  const { id } = useParams();
  const location = useLocation();
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
    <div className="mt-5 container">
      <div className="text-center mb-4">
        {ad.isSold && <Sold singleAd={true} />}
<<<<<<< HEAD
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
=======
        <div id="carouselExample" className="carousel slide">
          <div className="carousel-inner">
            {ad.images.map((image, i) => (
              <div
                className={`carousel-item ${idx === i ? "active" : ""}`}
                key={i}
              >
                <img
                  src={image.url}
                  className="d-block w-100"
                  alt={ad.title}
                  style={{ maxHeight: "500px", objectFit: "contain" }}
                />
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExample"
                  data-bs-slide="prev"
                  onClick={() => setIdx(i)}
                >
                  <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExample"
                  data-bs-slide="next"
                  onClick={() => setIdx(i)}
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row d-flex align-items-stretch">
        {/* First card: Price and details */}
        <div className="col-md-6 d-flex">
          <div className="card mb-4 h-100 w-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title">
                  BDT. {Number(ad.price).toLocaleString()}
                </h5>
                {val?.users?.includes(auth.currentUser?.uid) ? (
                  <AiFillStar
                    size={30}
                    onClick={() => toggleFavorite(val.users, id)}
                    className="text-warning cursor-pointer"
                  />
                ) : (
                  <AiOutlineStar
                    size={30}
                    onClick={() => toggleFavorite(val.users, id)}
                  />
                )}
              </div>
              <h6 className="card-subtitle mb-2">{ad.title}</h6>
              <p className="card-text">{ad.description}</p>
              {ad.condition && (
                <p className="card-text">
                  Condition: <strong>{ad.condition}</strong>
                </p>
              )}
              <div className="d-flex justify-content-between">
                <p className="card-text">
                  {ad.location} -{" "}
                  <small>
                    <Moment fromNow>{ad.publishedAt.toDate()}</Moment>
                  </small>
                </p>
                {ad.postedBy === auth.currentUser?.uid && (
                  <FaTrashAlt
                    style={{ height: '20px', width: '30px' }}
                    onClick={deleteAd}
                  />
                )}
              </div>
            </div>
>>>>>>> f28f3d3979f351030be47e83952a9d19b9451ef6
          </div>
        </div>

        {/* Second card: Seller information */}
        <div className="col-md-6 d-flex">
          <div className="card mb-4 h-100 w-100">
            <div className="card-body">
              <h5 className="card-title">Seller Description</h5>
              <Link to={`/profile/${ad.postedBy}`}>
                <div className="d-flex align-items-center">
                  {seller?.photoUrl ? (
                    <img
                      src={seller.photoUrl}
                      alt={seller.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                  ) : (
                    <FaUserCircle size={30} className="me-2" />
                  )}
                  <h6>{seller?.name}</h6>
                </div>
              </Link>
            </div>
            <div>
              {auth.currentUser ? (
                <div className="text-center">
                  {showNumber ? (
                    <p>
                      <FiPhoneCall size={20} /> {ad.contact}
                    </p>
                  ) : (
                    <div
                      className="icon-container"
                      onClick={() => setShowNumber(true)}
                      style={{ cursor: "pointer" }}
                    >
                      <FaPhoneAlt
                        size={40}
                        className="text-primary"
                        style={{ transition: "transform 0.3s", marginBottom: "10px" }}
                      />
                      <p>Show Contact Info</p>
                    </div>
                  )}
                  <br />
                  {ad.postedBy !== auth.currentUser?.uid && (
                    <div
                      className="icon-container"
                      style={{ cursor: "pointer" }}
                    >
                      <FaComments
                        size={40}
                        className="text-primary"
                        style={{ transition: "transform 0.3s" }}
                      />
                      <p>Chat with Seller</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center">
                  Please <Link to="/login">login</Link> to view contact info.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Ad;