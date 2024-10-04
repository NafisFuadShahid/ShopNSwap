import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FaUserAlt, FaCloudUploadAlt } from "react-icons/fa";
import moment from "moment";

const monthAndYear = (date) =>
  `${moment(date).format("MMMM").slice(0, 3)} ${moment(date).format("YYYY")}`;

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState();

  const getUser = async () => {
    const docSnap = await getDoc(doc(db, "users", id));
    if (docSnap.exists()) {
      setUser(docSnap.data());
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  console.log(user);
  return user ? (
    <div className="mt-5 container row">
      <div className="text-center col-sm-2 col-md-3">
        <FaUserAlt size={50} />
        <div class="dropdown my-3 text-center">
          <button
            class="btn btn-secondary btn-sm dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Edit
          </button>
          <ul class="dropdown-menu">
            <li>
              <label htmlFor="photo" className="dropdown-item">
                <FaCloudUploadAlt size={30} /> Upload Photo
              </label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                style={{ display: "none" }}
              />
            </li>
            <li className="dropdown-item btn">Remove Photo</li>
          </ul>
        </div>
        <p>Member since {monthAndYear(user.createdAt.toDate())}</p>
      </div>
      <div className="col-sm-10 col-md-9">
        <h3>{user.name}</h3>
        <hr />
      </div>
    </div>
  ) : null;
};

export default Profile;
