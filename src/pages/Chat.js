import React, { useEffect, useState } from "react";
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
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { FaSearch, FaPaperPlane, FaUserCircle, FaEye } from 'react-icons/fa';
import MessageForm from "../components/MessageForm";
import User from "../components/User";
import Message from "../components/Message";

const Chat = () => {
  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [online, setOnline] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();
  const user1 = auth.currentUser.uid;

  const selectUser = async (user) => {
    setChat(user);
    const user2 = user.other.uid;
    const id = user1 > user2
      ? `${user1}.${user2}.${user.ad.adId}`
      : `${user2}.${user1}.${user.ad.adId}`;

    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => msgs.push(doc.data()));
      setMsgs(msgs);
    });

    const docSnap = await getDoc(doc(db, "messages", id));
    if (docSnap.exists()) {
      if (docSnap.data().lastSender !== user1 && docSnap.data().lastUnread) {
        await updateDoc(doc(db, "messages", id), {
          lastUnread: false,
        });
      }
    }

    return () => unsub();
  };

  const getChat = async (ad) => {
    const buyer = await getDoc(doc(db, "users", user1));
    const seller = await getDoc(doc(db, "users", ad.postedBy));
    setChat({ ad, me: buyer.data(), other: seller.data() });
  };

  const getList = async () => {
    const msgRef = collection(db, "messages");
    const q = query(msgRef, where("users", "array-contains", user1));

    const msgsSnap = await getDocs(q);
    const messages = msgsSnap.docs.map((doc) => doc.data());

    const users = [];
    const unsubscribes = [];
    for (const message of messages) {
      const adRef = doc(db, "ads", message.ad);
      const meRef = doc(db, "users", message.users.find((id) => id === user1));
      const otherRef = doc(db, "users", message.users.find((id) => id !== user1));

      const adDoc = await getDoc(adRef);
      const meDoc = await getDoc(meRef);
      const otherDoc = await getDoc(otherRef);

      users.push({
        ad: adDoc.data(),
        me: meDoc.data(),
        other: otherDoc.data(),
      });

      const unsub = onSnapshot(otherRef, (doc) => {
        setOnline((prev) => ({
          ...prev,
          [doc.data().uid]: doc.data().isOnline,
        }));
      });
      unsubscribes.push(unsub);
    }
    setUsers(users);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    if (location.state?.ad) {
      getChat(location.state?.ad);
    }
    getList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user2 = chat.other.uid;
    const chatId = user1 > user2
      ? `${user1}.${user2}.${chat.ad.adId}`
      : `${user2}.${user1}.${chat.ad.adId}`;

    await addDoc(collection(db, "messages", chatId, "chat"), {
      text,
      sender: user1,
      createdAt: Timestamp.fromDate(new Date()),
    });

    await updateDoc(doc(db, "messages", chatId), {
      lastText: text,
      lastSender: user1,
      lastUnread: true,
    });
    setText("");
  };

  const filteredUsers = users.filter(user => 
    user.ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.other.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Users Section */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
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
            />
          ))}
        </div>
      </div>

      {/* Conversation Section */}
      <div className="flex-1 flex flex-col">
        {chat ? (
          <>
            <div className="bg-white p-4 border-b border-gray-300 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{chat.other.name}</h2>
                <Link
                  to={`/${chat.ad.category.toLowerCase()}/${chat.ad.adId}`}
                  className="text-blue-600 hover:underline"
                >
                  {chat.ad.title}
                </Link>
              </div>
              <Link
                to={`/${chat.ad.category.toLowerCase()}/${chat.ad.adId}`}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <FaEye className="mr-2" />
                View Ad
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {msgs.map((msg, i) => (
                <Message key={i} msg={msg} user1={user1} />
              ))}
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-300">
              <MessageForm
                text={text}
                setText={setText}
                handleSubmit={handleSubmit}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-xl">Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="w-1/4 bg-white border-l border-gray-300 overflow-y-auto">
        {chat && (
          <div className="p-4">
            <div className="flex flex-col items-center mb-4">
              {chat.other.avatar ? (
                <img src={chat.other.avatar} alt={chat.other.name} className="w-24 h-24 rounded-full mb-2" />
              ) : (
                <FaUserCircle className="w-24 h-24 text-gray-400 mb-2" />
              )}
              <h3 className="text-xl font-semibold">{chat.other.name}</h3>
              <p className="text-gray-600">Product Owner</p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold mb-2">Product Details</h4>
              <p><strong>Name:</strong> {chat.ad.title}</p>
              <p><strong>Price:</strong> ${chat.ad.price}</p>
              <p><strong>Category:</strong> {chat.ad.category}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
