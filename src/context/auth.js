import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import Loading from "../components/Loading";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy
} from "firebase/firestore";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState([]);             // chat unread
  const [notifications, setNotifications] = useState([]); // swap notifications

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // —— listen for chat unread messages —— 
        const msgRef = collection(db, "messages");
        const chatQuery = query(
          msgRef,
          where("users", "array-contains", user.uid)
        );
        const unsubMsgs = onSnapshot(chatQuery, (snap) => {
          const chats = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            if (
              data.lastText &&
              data.lastSender !== user.uid &&
              data.lastUnread
            ) {
              chats.push({ id: docSnap.id, ...data });
            }
          });
          setUnread(chats);
        });

        // —— listen for swap notifications —— 
        const notifRef = collection(db, "users", user.uid, "notification");
        const notifQuery = query(
          notifRef,
          orderBy("createdAt", "desc")
        );
        const unsubNotifs = onSnapshot(notifQuery, (snap) => {
          const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setNotifications(notifs.filter((n) => !n.isRead));
        });

        // cleanup both listeners
        return () => {
          unsubMsgs();
          unsubNotifs();
        };
      }
    });

    return () => unsubAuth();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ user, unread, notifications }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
