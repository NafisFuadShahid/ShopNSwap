import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { deleteDoc, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db, storage } from "../firebaseConfig";
import { ref, deleteObject } from "firebase/storage";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaTrashAlt, FaUserCircle, FaPhoneAlt } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import { HiOutlineTag, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import Moment from "react-moment";
import useSnapshot from "../utils/useSnapshot";
import { toggleFavorite } from "../utils/fav";
import Sold from "../components/Sold";
import Axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import MinimalGallery from "../components/ui/MinimalGallery";
import AdPageAnimation from "../components/ui/AdPageAnimation";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCurrentLocation, calculateDistance } from '../utils/location';

// Fix Leaflet's default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = ({ location }) => {
  if (!location || !location._lat || !location._long) {
    return <div className="text-gray-500">Location not available</div>;
  }

  const position = [location._lat, location._long];

  // Custom map style
  const mapStyle = {
    default: {
      filter: 'contrast(1.2) brightness(1.1)',
    },
    container: {
      background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
      borderRadius: '1rem',
      padding: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }
  };

  // Custom marker icon
  const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Map container with gradient border */}
      <div style={mapStyle.container} className="p-1">
        <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-lg relative">
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%', ...mapStyle.default }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position} icon={customIcon}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </Marker>

            {/* Animated pulse effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-ping" />
                <div className="w-16 h-16 bg-blue-500/40 rounded-full animate-pulse" />
              </div>
            </div>
          </MapContainer>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -z-10 inset-0 blur-3xl opacity-20">
        <div className="absolute top-0 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full" />
        <div className="absolute bottom-0 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full" />
      </div>
    </motion.div>
  );
};

const Ad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [idx, setIdx] = useState(0);
  const [seller, setSeller] = useState(null);
  const [showNumber, setShowNumber] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [swapAds, setSwapAds] = useState([]);
  const [showBidsDialog, setShowBidsDialog] = useState(false);
  const [bids, setBids] = useState([]);
  const [location, setLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceError, setDistanceError] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(true);

  const { val } = useSnapshot("favorites", id);

  const getAd = async () => {
    const docRef = doc(db, "ads", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const adData = docSnap.data();
      setAd({ id: docSnap.id, ...adData });
      
      // Set location if available
      if (adData.location) {
        setLocation({
          _lat: adData.location.latitude,
          _long: adData.location.longitude
        });
      }
      
      const sellerRef = doc(db, "users", adData.postedBy);
      const sellerSnap = await getDoc(sellerRef);
      if (sellerSnap.exists()) {
        setSeller({ id: sellerSnap.id, ...sellerSnap.data() });
      }
    }
  };

  useEffect(() => {
    getAd();
  }, [id]);

  useEffect(() => {
    setIsFavorite(val?.users?.includes(auth.currentUser?.uid) || false);
  }, [val, auth.currentUser]);

  useEffect(() => {
    if (auth.currentUser && ad) {
      fetchSwapAds();
      if (ad.adType === "swap" && ad.postedBy === auth.currentUser.uid) {
        fetchBids();
      }
    }
  }, [auth.currentUser, ad]);

  useEffect(() => {
    const checkDistance = async () => {
      if (ad && ad.adType === 'swap' && ad.location) {
        try {
          const currentLocation = await getCurrentLocation();
          setUserLocation(currentLocation);
          
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            ad.location.latitude,
            ad.location.longitude
          );
          
          // Check if within 20km radius
          const isInRange = distance <= 20;
          setIsWithinRange(isInRange);
          
          if (!isInRange) {
            setDistanceError('This item is too far away for swapping (more than 20km away)');
          }
        } catch (error) {
          console.error('Error getting location:', error);
          setDistanceError('Unable to determine your location. Please enable location access to swap items.');
        }
      }
    };

    checkDistance();
  }, [ad]);

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
    if (!auth.currentUser) {
      toast.error("Please login to message the seller");
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = auth.currentUser.uid;
      
      // Check if we're not trying to message ourselves
      if (loggedInUser === ad.postedBy) {
        toast.error("You cannot message yourself");
        return;
      }

      const chatId = loggedInUser > ad.postedBy
        ? `${loggedInUser}.${ad.postedBy}.${id}`
        : `${ad.postedBy}.${loggedInUser}.${id}`;
      
      // Check if chat already exists
      const chatRef = doc(db, "messages", chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          ad: id,
          users: [loggedInUser, ad.postedBy],
          createdAt: new Date(),
          lastMessage: null,
          lastMessageTime: null
        });
      }

      navigate("/chat", { state: { ad } });
    } catch (error) {
      console.error("Error creating chatroom:", error);
      toast.error("Failed to create chat. Please try again.");
    }
  };

  const bkashPaymentHandler = async () => {
    try {
      const response = await Axios.post('http://localhost:5000/bkash-checkout', {
        amount: ad.price,
        callbackURL: 'http://localhost:5000/bkash-callback', 
        orderID: '1234',
        reference: '12345',
      });
      console.log(response);
      window.location.href = response?.data;
    } catch (error) {
      console.log(error);
      toast.error("Payment initiation failed. Please try again.");
    }
  };

  const fetchSwapAds = async () => {
    const q = query(collection(db, "ads"), where("adType", "==", "swap"), where("postedBy", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const ads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSwapAds(ads);
  };

  const handleBidClick = () => {
    setShowBidDialog(true);
  };

  const handleSwapBid = async (swapAdId) => {
    try {
      await setDoc(doc(db, "bids", `${id}_${swapAdId}`), {
        originalAdId: id,
        swapAdId: swapAdId,
        bidder: auth.currentUser.uid,
        status: "pending",
        createdAt: new Date()
      });
      toast.success("Bid placed successfully!");
      setShowBidDialog(false);
    } catch (error) {
      console.error("Error placing bid: ", error);
      toast.error("Failed to place bid. Please try again.");
    }
  };

  const fetchBids = async () => {
    const q = query(collection(db, "bids"), where("originalAdId", "==", id));
    const querySnapshot = await getDocs(q);
    const fetchedBids = [];
    for (const bidDoc of querySnapshot.docs) {
      const bidData = bidDoc.data();
      const swapAdSnap = await getDoc(doc(db, "ads", bidData.swapAdId));
      const bidderSnap = await getDoc(doc(db, "users", bidData.bidder));
      if (swapAdSnap.exists() && bidderSnap.exists()) {
        fetchedBids.push({
          id: bidDoc.id,
          ...bidData,
          swapAd: { id: swapAdSnap.id, ...swapAdSnap.data() },
          bidder: { id: bidderSnap.id, ...bidderSnap.data() }
        });
      }
    }
    setBids(fetchedBids);
  };

  const handleViewBids = () => {
    setShowBidsDialog(true);
  };

  const handleChat = async () => {
    if (ad.adType === 'swap' && !isWithinRange) {
      toast.error('This item is too far away for swapping. Swaps are only available within 20km.');
      return;
    }

    try {
      const loggedInUser = auth.currentUser.uid;
      
      // Check if we're not trying to message ourselves
      if (loggedInUser === ad.postedBy) {
        toast.error("You cannot message yourself");
        return;
      }

      const chatId = loggedInUser > ad.postedBy
        ? `${loggedInUser}.${ad.postedBy}.${id}`
        : `${ad.postedBy}.${loggedInUser}.${id}`;
      
      // Check if chat already exists
      const chatRef = doc(db, "messages", chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          ad: id,
          users: [loggedInUser, ad.postedBy],
          createdAt: new Date(),
          lastMessage: null,
          lastMessageTime: null
        });
      }

      navigate("/chat", { state: { ad } });
    } catch (error) {
      console.error("Error creating chatroom:", error);
      toast.error("Failed to create chat. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <AdPageAnimation />
      
      {ad ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            {/* Image Gallery Section */}
            <div className="relative">
              <MinimalGallery images={ad.images} />
              
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavoriteClick}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md 
                  ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'} 
                  shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                {isFavorite ? (
                  <AiFillHeart className={`w-6 h-6 ${isAnimating ? 'animate-heart' : ''}`} />
                ) : (
                  <AiOutlineHeart className="w-6 h-6" />
                )}
              </motion.button>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column - Main Info */}
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h1 className="text-3xl font-bold mb-4">{ad.title}</h1>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary-500/10 to-purple-500/10 text-primary-700">
                        <HiOutlineTag className="w-4 h-4 mr-2" />
                        {ad.category}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700">
                        <HiOutlineClock className="w-4 h-4 mr-2" />
                        <Moment fromNow>{ad.publishedAt?.toDate()}</Moment>
                      </span>
                    </div>

                    {/* Price Section */}
                    {ad.price && (
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-primary-600">
                          ৳{ad.price.toLocaleString()}
                        </h2>
                      </div>
                    )}

                    {/* Description */}
                    <div className="prose max-w-none mb-8">
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-gray-600">{ad.description}</p>
                    </div>

                    {/* Location */}
                    {location && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Location</h3>
                        <MapView location={location} />
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Right Column - Seller Info & Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="w-full md:w-80 lg:w-96"
                >
                  {/* Seller Card */}
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      {seller?.avatar ? (
                        <img
                          src={seller.avatar}
                          alt={seller.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="w-12 h-12 text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-semibold">{seller?.name}</h3>
                        <p className="text-sm text-gray-500">Member since {seller?.createdAt?.toDate().getFullYear()}</p>
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="space-y-3">
                      {showNumber ? (
                        <a
                          href={`tel:${ad.contact}`}
                          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                        >
                          <FaPhoneAlt className="w-4 h-4" />
                          {ad.contact}
                        </a>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowNumber(true)}
                          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                        >
                          <FiPhoneCall className="w-4 h-4" />
                          Show Phone Number
                        </motion.button>
                      )}

                      {auth.currentUser?.uid !== ad.postedBy && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleChat}
                          disabled={ad.adType === 'swap' && !isWithinRange}
                          className={`flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-white font-medium 
                            ${ad.adType === 'swap' && !isWithinRange 
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-primary-500 hover:bg-primary-600'}`}
                        >
                          Message Seller
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {auth.currentUser?.uid === ad.postedBy && (
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={updateStatus}
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                      >
                        Mark as Sold
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={deleteAd}
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <FaTrashAlt className="w-4 h-4" />
                        Delete Ad
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      {distanceError && ad.adType === 'swap' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {distanceError}
        </div>
      )}
    </div>
  );
};

export default Ad;
