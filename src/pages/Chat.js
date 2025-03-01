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
import { debounce } from 'lodash';
import { Check, CheckCheck, Image, Paperclip, Send, X } from 'lucide-react';

const Message = ({ msg, user1, lastSeen }) => {
  const isOwn = msg.sender === user1;
  const hasBeenSeen = lastSeen && msg.createdAt && lastSeen > msg.createdAt.toDate();

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-lg p-3 ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          {msg.text && <p className="mb-1">{msg.text}</p>}
          
          {msg.image && (
            <div className="rounded-lg overflow-hidden mb-1">
              <img 
                src={msg.image.url} 
                alt="Message attachment" 
                className="max-w-full h-auto"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-end gap-1 text-xs opacity-70">
            <span>{new Date(msg.createdAt?.toDate()).toLocaleTimeString()}</span>
            {isOwn && (
              hasBeenSeen ? <CheckCheck size={14} /> : <Check size={14} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserListItem = ({ user, isSelected, unreadCount, online, onClick }) => (
  <div
    onClick={onClick}
    className={`p-4 cursor-pointer transition-colors ${
      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="relative">
        <img
          src={user.other.photoURL || user.other.photoUrl}
          alt={user.other.name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.other.name)}`;
          }}
        />
        {online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{user.other.name}</h3>
        <p className="text-sm text-gray-500 truncate">{user.ad.title}</p>
      </div>
      {unreadCount > 0 && (
        <span className="bg-blue-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
          {unreadCount}
        </span>
      )}
    </div>
  </div>
);

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
  const [imageUpload, setImageUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const location = useLocation();
  const user1 = auth.currentUser?.uid;
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user1) return;

    const userDoc = doc(db, "users", user1);
    updateDoc(userDoc, { isOnline: true });

    return () => {
      updateDoc(userDoc, { isOnline: false });
    };
  }, [user1]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [msgs]);

  const selectUser = useCallback(async (user) => {
    setChat(user);
    const user2 = user.other.uid;
    const id = user1 > user2
      ? `${user1}.${user2}.${user.ad.adId}`
      : `${user2}.${user1}.${user.ad.adId}`;

    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMsgs(msgs);
      scrollToBottom();
    });

    const chatDoc = doc(db, "messages", id);
    await updateDoc(chatDoc, {
      [`lastSeen.${user1}`]: serverTimestamp(),
      [`unreadCount.${user1}`]: 0
    });

    const unsubLastSeen = onSnapshot(chatDoc, (doc) => {
      if (doc.exists()) {
        setLastSeen(doc.data().lastSeen || {});
      }
    });

    return () => {
      unsubscribe();
      unsubLastSeen();
    };
  }, [user1, scrollToBottom]);

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

  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    try {
      setUploading(true);
      const storage = getStorage();
      const storageRef = ref(storage, `chat_images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        url: downloadURL,
        name: file.name,
        type: file.type
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!chat || (!text.trim() && !imageUpload) || !user1) return;

    const user2 = chat.other.uid;
    const chatId = user1 > user2
      ? `${user1}.${user2}.${chat.ad.adId}`
      : `${user2}.${user1}.${chat.ad.adId}`;

    let image = null;
    if (imageUpload) {
      image = await handleImageUpload(imageUpload);
      setImageUpload(null);
    }

    const newMsg = {
      text: text.trim(),
      sender: user1,
      createdAt: serverTimestamp(),
      ...(image && { image })
    };

    await addDoc(collection(db, "messages", chatId, "chat"), newMsg);

    await updateDoc(doc(db, "messages", chatId), {
      lastMessage: text.trim() || "Sent an image",
      lastSender: user1,
      [`unreadCount.${user2}`]: (unreadCounts[chatId] || 0) + 1,
      updatedAt: serverTimestamp()
    });

    setText("");
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat List */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {users
            .filter(user =>
              user.ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.other.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((user) => (
              <UserListItem
                key={user.other.uid}
                user={user}
                isSelected={chat?.other.uid === user.other.uid}
                unreadCount={unreadCounts[`${user1}.${user.other.uid}.${user.ad.adId}`] || 0}
                online={online[user.other.uid]}
                onClick={() => selectUser(user)}
              />
            ))
          }
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {chat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center">
              <img
                src={chat.other.photoURL || chat.other.photoUrl}
                alt={chat.other.name}
                className="w-10 h-10 rounded-full mr-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.other.name)}`;
                }}
              />
              <div>
                <h2 className="font-semibold">{chat.other.name}</h2>
                <p className="text-sm text-gray-500">
                  {online[chat.other.uid] ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {msgs.map((msg) => (
                <Message
                  key={msg.id}
                  msg={msg}
                  user1={user1}
                  lastSeen={lastSeen[chat.other.uid]}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Image size={20}
/>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setImageUpload(e.target.files[0])}
                />
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
                  value={text}
                  onChange={(e) => handleTyping(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={(!text.trim() && !imageUpload) || uploading}
                  className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
              {imageUpload && (
                <div className="mt-2 p-2 bg-gray-100 rounded flex items-center">
                  <img
                    src={URL.createObjectURL(imageUpload)}
                    alt="Upload preview"
                    className="h-10 w-10 object-cover rounded mr-2"
                  />
                  <span className="flex-1 truncate">{imageUpload.name}</span>
                  <button
                    onClick={() => setImageUpload(null)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* Ad Info */}
      {chat && (
        <div className="w-1/4 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <div className="mb-4">
            {chat.ad.images && chat.ad.images.length > 0 ? (
              <img
                src={chat.ad.images[0].url}
                alt={chat.ad.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">{chat.ad.title}</h3>
          <p className="text-gray-600 mb-4">{chat.other.name}</p>
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Price</h4>
            <p>৳{chat.ad.price}</p>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Category</h4>
            <p>{chat.ad.category}</p>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Description</h4>
            <p className="text-gray-600">{chat.ad.description}</p>
          </div>
          <Link
            to={`/ads/${chat.ad.adId}`}
            className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            View Ad
          </Link>
        </div>
      )}
    </div>
  );
}

