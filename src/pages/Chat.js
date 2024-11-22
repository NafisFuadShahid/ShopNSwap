import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  setDoc
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { AuthContext } from "../context/auth";
import { FaSearch, FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import MessageForm from "../components/MessageForm";
import User from "../components/User";
import Message from "../components/Message";

export default function Chat() {
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [online, setOnline] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (location.state?.ad) {
      getChat(location.state?.ad);
    }
    getList();
  }, [user]);

  const selectUser = async (user) => {
    try {
      setChat(user);
      const user2 = user.other.uid;
      const id = user.uid;  // Use the message document ID directly

      // Create messages document if it doesn't exist
      const chatDocRef = doc(db, "messages", id);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        await setDoc(chatDocRef, {
          users: [auth.currentUser.uid, user2],
          ad: user.ad.adId,
          lastText: "",
          lastSender: "",
          lastUnread: false,
          lastMessageTime: Timestamp.fromDate(new Date())
        });
      }

      // Set up real-time listener for messages
      const msgsRef = collection(db, "messages", id, "chat");
      const q = query(msgsRef, orderBy("createdAt", "asc"));

      const unsub = onSnapshot(q, (querySnapshot) => {
        let msgs = [];
        querySnapshot.forEach((doc) => {
          msgs.push(doc.data());
        });
        setMsgs(msgs);
      }, (error) => {
        console.error("Error in messages listener:", error);
      });

      // Mark messages as read
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        if (data.lastSender !== auth.currentUser.uid && data.lastUnread) {
          await updateDoc(chatDocRef, {
            lastUnread: false,
          });
        }
      }

      return () => unsub();
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  const getChat = async (ad) => {
    try {
      const buyer = await getDoc(doc(db, "users", user.uid));
      const seller = await getDoc(doc(db, "users", ad.postedBy));
      setChat({ ad, me: buyer.data(), other: seller.data() });
    } catch (error) {
      console.error("Error getting chat:", error);
    }
  };

  const getList = async () => {
    try {
      setLoading(true);
      const msgRef = collection(db, "messages");
      // Simplified query to avoid requiring complex indexes
      const q = query(
        msgRef,
        where("users", "array-contains", user.uid),
        orderBy("lastMessageTime", "desc")
      );

      const msgsSnap = await getDocs(q);
      const messages = msgsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      const users = [];
      const unsubscribes = [];
      
      for (const message of messages) {
        try {
          // Get the other user's ID (the one who isn't the current user)
          const otherUserId = message.users.find(id => id !== user.uid);
          if (!otherUserId) continue; // Skip if we can't find the other user

          const [adDoc, otherDoc] = await Promise.all([
            getDoc(doc(db, "ads", message.ad)),
            getDoc(doc(db, "users", otherUserId))
          ]);

          if (adDoc.exists() && otherDoc.exists()) {
            users.push({
              uid: message.id, // Use message ID as chat ID
              ad: { ...adDoc.data(), adId: adDoc.id },
              other: { ...otherDoc.data(), uid: otherUserId },
            });

            // Set up real-time listener for user online status
            const unsub = onSnapshot(doc(db, "users", otherUserId), (doc) => {
              if (doc.exists()) {
                setOnline(prev => ({
                  ...prev,
                  [otherUserId]: doc.data().isOnline || false
                }));
              }
            });
            unsubscribes.push(unsub);
          }
        } catch (error) {
          console.error("Error processing chat:", error);
          // Continue with other chats even if one fails
          continue;
        }
      }
      
      setUsers(users);
      setLoading(false);

      return () => {
        unsubscribes.forEach(unsub => unsub());
      };
    } catch (error) {
      console.error("Error getting chat list:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!chat || !text.trim()) return;

    try {
      const user2 = chat.other.uid;
      const chatId = chat.uid;  // Use the message document ID directly

      // First, ensure the main message document exists
      const chatDocRef = doc(db, "messages", chatId);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        // Create the main message document if it doesn't exist
        await setDoc(chatDocRef, {
          users: [auth.currentUser.uid, user2],
          ad: chat.ad.adId,
          lastText: text,
          lastSender: auth.currentUser.uid,
          lastUnread: true,
          lastMessageTime: Timestamp.fromDate(new Date())
        });
      }

      // Add the message to the chat subcollection
      await addDoc(collection(db, "messages", chatId, "chat"), {
        text,
        sender: auth.currentUser.uid,
        createdAt: Timestamp.fromDate(new Date()),
      });

      // Update the main message document
      await updateDoc(chatDocRef, {
        lastText: text,
        lastSender: auth.currentUser.uid,
        lastUnread: true,
        lastMessageTime: Timestamp.fromDate(new Date())
      });
      
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.other.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex h-[calc(100vh-8rem)]">
          {/* Users Section */}
          <div className="w-1/4 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, i) => (
                  <User
                    key={i}
                    user={user}
                    selectUser={selectUser}
                    chat={chat}
                    online={online}
                    user1={user.uid}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p className="text-center">No chats found</p>
                  <p className="text-sm">Start a conversation by messaging a seller!</p>
                </div>
              )}
            </div>
          </div>

          {/* Conversation Section */}
          <div className="flex-1 flex flex-col">
            {chat ? (
              <>
                <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {chat.other.avatar ? (
                      <img
                        src={chat.other.avatar}
                        alt={chat.other.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-10 h-10 text-gray-400" />
                    )}
                    <div>
                      <h2 className="text-lg font-semibold">{chat.other.name}</h2>
                      <p className="text-sm text-gray-600">{chat.ad.title}</p>
                    </div>
                  </div>
                  <Link
                    to={`/ad/${chat.ad.adId}`}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition duration-200"
                  >
                    View Ad
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {msgs.map((msg, i) => (
                    <Message key={i} msg={msg} user1={user.uid} />
                  ))}
                </div>
                <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
                  <MessageForm
                    text={text}
                    setText={setText}
                    handleSubmit={handleSubmit}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-xl font-semibold mb-2">Welcome to Messages</p>
                <p className="text-center text-sm">
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}