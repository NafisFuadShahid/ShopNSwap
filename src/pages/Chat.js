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
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { useLocation, Link } from "react-router-dom";
import MessageForm from "../components/MessageForm";
import User from "../components/User";
import Message from "../components/Message";

const Chat = () => {
  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [online, setOnline] = useState({});

  const location = useLocation();

  const user1 = auth.currentUser.uid;

  const selectUser = async (user) => {
    setChat(user);

    const user2 = user.other.uid;
    const id =
      user1 > user2
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
      const meRef = doc(
        db,
        "users",
        message.users.find((id) => id === user1)
      );
      const otherRef = doc(
        db,
        "users",
        message.users.find((id) => id !== user1)
      );

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
    const chatId =
      user1 > user2
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

  return (
    <div className="chat-container">
      <div className="users-container">
        {users.map((user, i) => (
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
      <div className="chat-area">
        {chat ? (
          <>
            <div className="chat-header">
              <h3>{chat.other.name}</h3>
              <Link
                className="product-name-link"
                to={`/${chat.ad.category.toLowerCase()}/${chat.ad.adId}`}
              >
                {chat.ad.title}
              </Link>
            </div>
            <div className="chat-ad-details">
              <img
                src={chat.ad.images[0].url}
                alt={chat.ad.title}
                className="ad-image"
              />
              <div className="ad-info">
                <h6>{chat.ad.title}</h6>
                <small>{chat.ad.price}</small>
              </div>
            </div>
            <div className="messages-container">
              {msgs.map((msg, i) => (
                <Message key={i} msg={msg} user1={user1} />
              ))}
            </div>
            <MessageForm
              text={text}
              setText={setText}
              handleSubmit={handleSubmit}
            />
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a user to start conversation</h3>
          </div>
        )}
      </div>

      {/* Inline CSS Styles */}
      <style jsx="true">{`
        .chat-container {
          display: flex;
          height: 100vh;
          background-color: #ffffff;
        }
        .users-container {
          width: 25%;
          background: rgba(138, 43, 226, 0.1); /* Transparent light purple */
          overflow-y: auto;
          padding: 20px;
          border-right: 1px solid #ddd;
        }
        .chat-area {
          width: 75%;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .chat-header {
          text-align: center;
          padding: 10px;
          border-bottom: 1px solid #ddd;
          background: rgba(138, 43, 226, 0.1); /* Transparent light purple */
        }
        .product-name-link {
          display: block;
          margin-top: 5px;
          font-weight: bold;
          color: #4f46e5;
          text-decoration: none;
        }
        .product-name-link:hover {
          text-decoration: underline;
        }
        .chat-ad-details {
          display: flex;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .ad-image {
          width: 50px;
          height: 50px;
          border-radius: 5px;
        }
        .ad-info {
          flex-grow: 1;
          margin-left: 10px;
        }
        .messages-container {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px;
          max-height: calc(100vh - 170px); /* Limits the message container height */
        }
        .no-chat-selected {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #6b7280;
        }
        .message-form {
          padding: 10px;
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default Chat;
