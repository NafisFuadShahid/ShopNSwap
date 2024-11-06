import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebaseConfig";
import { ref, deleteObject } from "firebase/storage";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaTrashAlt, FaUserCircle, FaPhoneAlt, FaComments } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import Moment from "react-moment";
import useSnapshot from "../utils/useSnapshot";
import { toggleFavorite } from "../utils/fav";
import Sold from "../components/Sold";

const Ad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
    <div className="mt-5 container">
      <div className="text-center mb-4">
        {ad.isSold && <Sold singleAd={true} />}
        <div id="carouselExample" className="carousel slide">
          <div className="carousel-inner">
            {ad.images.map((image, i) => (
              <div className={`carousel-item ${idx === i ? "active" : ""}`} key={i}>
                <img src={image.url} className="d-block w-100" alt={ad.title} style={{ maxHeight: "500px", objectFit: "contain" }} />
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev" onClick={() => setIdx(i)}>
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next" onClick={() => setIdx(i)}>
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row d-flex align-items-stretch">
        {/* Product Details */}
        <div className="col-md-6 d-flex">
          <div className="card mb-4 h-100 w-100 shadow-sm rounded">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title text-primary mb-0">
                  BDT. {Number(ad.price).toLocaleString()}
                </h5>
                <div onClick={handleFavoriteClick} className={`cursor-pointer transition-transform duration-300 ${isAnimating ? 'animate-heart' : ''}`} style={{ transition: "color 0.3s ease" }}>
                  {isFavorite ? <AiFillHeart size={27} className="text-pink-500" /> : <AiOutlineHeart size={27} className="text-gray-300" />}
                </div>
              </div>
              <h6 className="card-subtitle text-muted mb-2">{ad.title}</h6>
              <p className="card-text mb-2">{ad.description}</p>
              {ad.condition && <p className="card-text">Condition: <strong>{ad.condition}</strong></p>}
              <p className="card-text">{ad.location} - <small><Moment fromNow>{ad.publishedAt.toDate()}</Moment></small></p>
              {ad.postedBy === auth.currentUser?.uid && (
                <FaTrashAlt className="text-danger cursor-pointer hover:scale-110" size={22} onClick={deleteAd} style={{ transition: "transform 0.2s ease" }} />
              )}
            </div>
          </div>
        </div>

        {/* Seller Information */}
        <div className="col-md-6 d-flex">
          <div className="card mb-4 h-100 w-100 shadow-sm rounded">
            <div className="card-body">
              <h5 className="card-title text-primary">Seller Description</h5>
              <Link to={`/profile/${ad.postedBy}`}>
                <div className="d-flex align-items-center mb-3">
                  {seller?.photoUrl ? <img src={seller.photoUrl} alt={seller.name} className="rounded-circle me-3" style={{ width: "50px", height: "50px" }} /> : <FaUserCircle size={40} className="me-3" />}
                  <h6 className="mb-0">{seller?.name}</h6>
                </div>
              </Link>
              <div className="text-center">
                {auth.currentUser ? (
                  <>
                    {showNumber ? <p className="text-muted"><FiPhoneCall size={20} /> {ad.contact}</p> : <button className="btn btn-primary m-2" onClick={() => setShowNumber(true)}><FaPhoneAlt size={20} className="mb-1" /> Show Contact Info</button>}
                    {ad.postedBy !== auth.currentUser?.uid && <button className="btn btn-success m-2" onClick={createChatroom}><FaComments size={20} className="mb-1" /> Chat with Seller</button>}
                  </>
                ) : (
                  <p className="text-center">Please <Link to="/login">login</Link> to view contact info.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Ad;
