// src/utils/sendNotification.js
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Sends a Firestore notification to a given user.
 *
 * @param {string} toUserId   UID of the recipient
 * @param {string} type       e.g. 'swap_request'
 * @param {string} message    e.g. 'Alice wants to swap for your item.'
 * @param {string} link       e.g. '/swap-requests' or `/ad/${adId}`
 */
export async function sendNotification(toUserId, type, message, link = "") {
  try {
    const notifRef = collection(doc(db, "users", toUserId), "notification");
    await addDoc(notifRef, {
      type,
      message,
      link,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    console.log("Notification sent to", toUserId);
  } catch (err) {
    console.error("❌ Error sending notification:", err);
  }
}
