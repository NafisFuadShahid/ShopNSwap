import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { useLocation, Link } from "react-router-dom";

const Chat = () => {
  const [chat, setChat] = useState();
  const location = useLocation();

  const getChat = async (ad) => {
    const buyer = await getDoc(doc(db, "users", auth.currentUser.uid));
    const seller = await getDoc(doc(db, "users", ad.postedBy));
    setChat({ ad, me: buyer.data(), other: seller.data() });
  };

  useEffect(() => {
    if (location.state?.ad) {
      getChat(location.state?.ad);
    }
  }, []);

  console.log(chat);
  return (
    <div className="row">
      <div
        className="col-2 col-md-4 users_container"
        style={{ borderRight: "1px solid #ddd" }}
      ></div>
      <div className="col-10 col-md-8">
        {chat ? (
          <>
            <div
              className="text-center mt-1"
              style={{ borderBottom: "1px solid #ddd" }}
            >
              <h3>{chat.other.name}</h3>
            </div>
            <div className="p-2" style={{ borderBottom: "1px solid #ddd" }}>
              <div className="d-flex align-items-center">
                <img
                  src={chat.ad.images[0].url}
                  alt={chat.ad.title}
                  style={{ width: "50px", height: "50px" }}
                />
                <div className="d-flex align-items-center justify-content-between flex-grow-1 ms-1">
                  <div>
                    <h6>{chat.ad.title}</h6>
                    <small>{chat.ad.price}</small>
                  </div>
                  <Link
                    className="btn btn-secondary btn-sm"
                    to={`/${chat.ad.category.toLowerCase()}/${chat.ad.id}`}
                  >
                    View Ad
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center mt-5">
            <h3>Select a user to start conversation</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
