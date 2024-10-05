import { signOut } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore"; // Importing getDoc to fetch data from Firestore
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { auth, db } from "../firebaseConfig"; // Assuming auth and db are already set up
import { Dropdown } from "react-bootstrap";
import { FaUserAlt } from "react-icons/fa"; // Importing the icon
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null); // State to hold the photo URL

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setPhotoUrl(userData.photoUrl); // Set the photo URL from Firestore
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignout = async () => {
    const confirm = window.confirm("Are you sure you want to log out?");
    if (confirm) {
      await updateDoc(doc(db, "users", user.uid), {
        isOnline: false,
      });
      await signOut(auth);
      navigate("/auth/login");
    }
  };

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary pulse-logo" to="/">
          ShopNSwap
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                <li className="nav-item">
                  <Dropdown>
                    <Dropdown.Toggle
                      id="dropdown-basic"
                      variant="light"
                      className="d-flex align-items-center border-0 bg-transparent"
                    >
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={user.name || "Profile Avatar"}
                          className="rounded-circle"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            
                          }}
                        />
                      ) : (
                        <FaUserAlt size={30} className="text-secondary" />
                      )}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to={`/profile/${user.uid}`}>
                        Profile
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={`/sell`}>
                        Sell
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={`/favorites`}>
                        My Favorites
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleSignout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-dark" to="/auth/register">
                    Register
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-dark" to="/auth/login">
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
