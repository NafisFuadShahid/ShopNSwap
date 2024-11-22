import { updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export const toggleFavorite = async (users, adId) => {
  let isFav = users.includes(auth.currentUser.uid);

  await updateDoc(doc(db, "favorites", adId), {
    users: isFav
      ? users.filter((id) => id !== auth.currentUser.uid)
      : users.concat(auth.currentUser.uid),
  });
};
