import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from "../firebaseConfig";
import { FaSearch, FaUserCircle, FaEllipsisV } from 'react-icons/fa';
import MessageForm from "../components/MessageForm";
import User from "../components/User";
import Message from "../components/Message";
import { debounce } from 'lodash';

export default function Chat() {
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [online, setOnline] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [attachment, setAttachment] = useState(null);
  
  const location = useLocation();
  const user1 = auth.currentUser?.uid;
  const messagesEndRef = useRef(null);
  const storage = getStorage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [msgs]);

  const selectUser = useCallback(async (user) => {
    setChat(user);
    const user2 = user.other.uid;
    const id = user1 > user2
      ? `${user1}.${user2}.${user.ad.adId}`
      : `${user2}.${user1}.${user.ad.adId}`;

    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        const msgData = doc.data();
        msgs.push({ ...msgData, id: doc.id });
      });
      setMsgs(msgs);
    });

    const docSnap = await getDoc(doc(db, "messages", id));
    if (docSnap.exists()) {
      if (docSnap.data().lastSender !== user1 && docSnap.data().lastUnread) {
        await updateDoc(doc(db, "messages", id), {
          lastUnread: false,
        });
      }
      setLastSeen(docSnap.data().lastSeen || {});
    }

    await updateDoc(doc(db, "messages", id), {
      [`unreadCount.${user1}`]: 0
    });

    return () => unsub();
  }, [user1]);

  const getChat = useCallback(async (ad) => {
    if (!user1) return;
    const buyer = await getDoc(doc(db, "users", user1));
    const seller = await getDoc(doc(db, "users", ad.postedBy));
    setChat({ ad, me: buyer.data(), other: seller.data() });
  }, [user1]);

  const getList = useCallback(async () => {
    if (!user1) return;
    const msgRef = collection(db, "messages");
    const q = query(msgRef, where("users", "array-contains", user1));

    const msgsSnap = await getDocs(q);
    const messages = msgsSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    const users = [];
    const unsubscribes = [];
    for (const message of messages) {
      const adRef = doc(db, "ads", message.ad);
      const meRef = doc(db, "users", message.users.find((id) => id === user1));
      const otherRef = doc(db, "users", message.users.find((id) => id !== user1));

      const [adDoc, meDoc, otherDoc] = await Promise.all([
        getDoc(adRef),
        getDoc(meRef),
        getDoc(otherRef)
      ]);

      if (adDoc.exists() && meDoc.exists() && otherDoc.exists()) {
        users.push({
          ad: { ...adDoc.data(), adId: adDoc.id },
          me: meDoc.data(),
          other: otherDoc.data(),
        });

        const unsub = onSnapshot(doc(db, "messages", message.id), (doc) => {
          const data = doc.data();
          setOnline((prev) => ({
            ...prev,
            [otherDoc.id]: data.online?.[otherDoc.id] || false,
          }));
          setUnreadCounts((prev) => ({
            ...prev,
            [message.id]: data.unreadCount?.[user1] || 0,
          }));
        });
        unsubscribes.push(unsub);
      }
    }
    setUsers(users);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [user1]);

  useEffect(() => {
    if (user1) {
      if (location.state?.ad) {
        getChat(location.state.ad);
      }
      getList();
    }
  }, [user1, location.state, getChat, getList]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!chat || (!text.trim() && !attachment) || !user1) return;

    const user2 = chat.other.uid;
    const chatId = user1 > user2
      ? `${user1}.${user2}.${chat.ad.adId}`
      : `${user2}.${user1}.${chat.ad.adId}`;

    const newMsg = {
      text,
      sender: user1,
      createdAt: serverTimestamp(),
      status: 'sent'
    };

    if (attachment) {
      newMsg.attachment = attachment;
    }

    await addDoc(collection(db, "messages", chatId, "chat"), newMsg);

    await updateDoc(doc(db, "messages", chatId), {
      lastText: text || "Attachment",
      lastSender: user1,
      lastUnread: true,
      [`unreadCount.${user2}`]: (unreadCounts[chatId] || 0) + 1,
    });

    const updatedLastSeen = { ...lastSeen, [user1]: serverTimestamp() };
    await updateDoc(doc(db, "messages", chatId), { lastSeen: updatedLastSeen });
    setLastSeen(updatedLastSeen);

    setText("");
    setAttachment(null);
    setIsTyping(false);
  };

  const handleTyping = useCallback((newText) => {
    setText(newText);
    setIsTyping(newText.length > 0);
    debouncedTypingStatus(newText.length > 0);
  }, []);

  const debouncedTypingStatus = useCallback(
    debounce((isTyping) => {
      if (!chat || !user1) return;
      const user2 = chat.other.uid;
      const chatId = user1 > user2
        ? `${user1}.${user2}.${chat.ad.adId}`
        : `${user2}.${user1}.${chat.ad.adId}`;
      updateDoc(doc(db, "messages", chatId), {
        [`typing.${user1}`]: isTyping
      });
    }, 500),
    [chat, user1]
  );

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      const storageRef = ref(storage, `chat_attachments/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setAttachment({
        name: file.name,
        url: downloadURL,
        type: file.type
      });
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.other.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-full md:w-1/4 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-300">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user, i) => (
            <User
              key={i}
              user={user}
              selectUser={selectUser}
              chat={chat}
              online={online}
              user1={user1}
              unreadCount={unreadCounts[`${user1}.${user.other.uid}.${user.ad.adId}`] || 0}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {chat ? (
          <>
            <div className="bg-white p-4 border-b border-gray-300 flex justify-between items-center">
              <div className="flex items-center">
                {chat.other.photoURL || chat.other.profileImage ? (
                  <img
                    src={chat.other.photoURL || chat.other.profileImage}
                    alt={chat.other.name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full mr-3 bg-gray-200 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {chat.other.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">{chat.other.name}</h2>
                  <p className="text-sm text-gray-600">
                    {online[chat.other.uid] ? (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Online
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        Offline
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  to={`/${chat.ad.category.toLowerCase()}/${chat.ad.adId}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 mr-2"
                >
                  View Ad
                </Link>
                <button className="text-gray-600 hover:text-gray-800">
                  <FaEllipsisV />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {msgs.map((msg, i) => (
                <Message 
                  key={i} 
                  msg={msg} 
                  user1={user1}
                  lastSeen={lastSeen[chat.other.uid]}
                />
              ))}
              {attachment && (
                <div className="bg-gray-200 p-2 rounded">
                  <p>Attachment: {attachment.name}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-300">
              <MessageForm
                text={text}
                setText={handleTyping}
                handleSubmit={handleSubmit}
                isTyping={isTyping}
                handleFileUpload={handleFileUpload}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-xl">Select a chat to start messaging</p>
          </div>
        )}
      </div>

      <div className="hidden md:block w-1/4 bg-white border-l border-gray-300 overflow-y-auto">
        {chat && (
          <div className="p-4">
            <div className="flex flex-col items-center mb-4">
              {chat.ad.images && chat.ad.images.length > 0 ? (
                <img 
                  src={chat.ad.images[0].url} 
                  alt={chat.ad.title}
                  className="w-full h-48 object-cover mb-2 rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-2 rounded">
                  <FaUserCircle className="w-24 h-24 text-gray-400" />
                </div>
              )}
              <h3 className="text-xl font-semibold">{chat.ad.title}</h3>
              <p className="text-gray-600">{chat.other.name}</p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold mb-2">Product Details</h4>
              <p><strong>Price:</strong> ৳{chat.ad.price}</p>
              <p><strong>Category:</strong> {chat.ad.category}</p>
              <p><strong>Description:</strong> {chat.ad.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}