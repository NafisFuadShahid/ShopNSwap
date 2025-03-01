import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Moment from "react-moment";
import { db, auth } from "../firebaseConfig";
import {
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";
import {
  FaEdit,
  FaTrash,
} from "react-icons/fa";

/** Utility to render star icons horizontally for a given rating (1-5). */
function renderStars(rating = 0) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(
        <AiFillStar key={i} className="text-yellow-400 inline-block" />
      );
    } else {
      stars.push(
        <AiOutlineStar key={i} className="text-yellow-400 inline-block" />
      );
    }
  }
  return stars;
}

const ReviewSection = ({ adId }) => {
  // =========== REVIEWS ===========
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // For editing a review
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState("");
  const [editingReviewRating, setEditingReviewRating] = useState(5);

  // =========== REPLIES ===========
  const [activeReplyForm, setActiveReplyForm] = useState(null);
  const [replyText, setReplyText] = useState("");

  /**
   * repliesByReview = {
   *   [reviewId]: [ { id, comment, userId, ... }, ... ]
   * }
   */
  const [repliesByReview, setRepliesByReview] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyText, setEditingReplyText] = useState("");

  // For average rating
  const [averageRating, setAverageRating] = useState(0);

  /** Fetch reviews for this ad */
  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("adId", "==", adId)
      );
      const querySnapshot = await getDocs(reviewsQuery);
      const fetchedReviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  /** Recompute average rating whenever `reviews` changes */
  const computeAverageRating = (allReviews) => {
    if (!allReviews.length) {
      setAverageRating(0);
      return;
    }
    const total = allReviews.reduce((sum, rev) => sum + (rev.rating || 0), 0);
    setAverageRating(total / allReviews.length);
  };

  // Fetch reviews and replies (eagerly) on mount
  useEffect(() => {
    if (!adId) return;
    (async () => {
      await fetchReviews();
      // We’ll call fetchRepliesForAllReviews() in a moment, 
      // but the simplest way is to do it inside refreshReviews or separately below.
    })();
  }, [adId]);

  // Once reviews are loaded, fetch their replies for correct counts
  useEffect(() => {
    computeAverageRating(reviews);
    fetchRepliesForAllReviews(reviews);
  }, [reviews]);

  /**
   * Eagerly fetch replies for *all* reviews at once
   * so you can display the correct reply count immediately.
   */
  const fetchRepliesForAllReviews = async (theReviews) => {
    const updatedRepliesByReview = { ...repliesByReview };

    for (let rev of theReviews) {
      try {
        const repliesQuery = query(
          collection(db, "replies"),
          where("reviewId", "==", rev.id)
        );
        const querySnapshot = await getDocs(repliesQuery);
        const fetchedReplies = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        updatedRepliesByReview[rev.id] = fetchedReplies;
      } catch (error) {
        console.error("Error fetching replies:", error);
      }
    }

    setRepliesByReview(updatedRepliesByReview);
  };

  /** Refresh reviews list from Firestore */
  const refreshReviews = async () => {
    const updated = await getDocs(
      query(collection(db, "reviews"), where("adId", "==", adId))
    );
    const updatedReviews = updated.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReviews(updatedReviews);
    // If you want to re-fetch replies each time as well:
    fetchRepliesForAllReviews(updatedReviews);
  };

  /** Submit a new review */
  const submitReview = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("Please login to leave a review.");
      return;
    }
    // Fetch the user's name
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let userName = "User";
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      userName = userData.name || "User";
    }

    try {
      await addDoc(collection(db, "reviews"), {
        adId,
        userId: auth.currentUser.uid,
        comment: review,
        rating: reviewRating,
        createdAt: new Date(),
        userName: userName,
      });
      toast.success("Review submitted!");
      setReview("");
      setReviewRating(5);
      await refreshReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  /** Delete a review (if current user is the reviewer) */
  const deleteReview = async (reviewId, reviewUserId) => {
    if (auth.currentUser?.uid !== reviewUserId) {
      toast.error("You are not authorized to delete this review.");
      return;
    }
    const confirmDelete = window.confirm("Delete this review?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      toast.success("Review deleted!");
      await refreshReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  /** Start editing a review */
  const startEditingReview = (rev) => {
    setEditingReviewId(rev.id);
    setEditingReviewText(rev.comment);
    setEditingReviewRating(rev.rating || 5);
  };

  /** Cancel editing a review */
  const cancelEditingReview = () => {
    setEditingReviewId(null);
    setEditingReviewText("");
    setEditingReviewRating(5);
  };

  /** Save the edited review */
  const saveEditedReview = async (reviewId, reviewUserId) => {
    if (auth.currentUser?.uid !== reviewUserId) {
      toast.error("You are not authorized to edit this review.");
      return;
    }
    try {
      await updateDoc(doc(db, "reviews", reviewId), {
        comment: editingReviewText,
        rating: editingReviewRating,
      });
      toast.success("Review updated!");
      cancelEditingReview();
      await refreshReviews();
    } catch (error) {
      console.error("Error editing review:", error);
      toast.error("Failed to edit review");
    }
  };

  // =========== REPLIES ===========

  /** Toggle reply form for a specific review
   *  (still fetch on-demand if you want fresh data, 
   *   or you can rely on your “eager” approach above) */
  const toggleReplyForm = async (reviewId) => {
    if (activeReplyForm === reviewId) {
      // Close it if open
      setActiveReplyForm(null);
    } else {
      // Open it
      setActiveReplyForm(reviewId);
      // Optionally re-fetch replies again if you want them always fresh:
      // await fetchRepliesForSingleReview(reviewId);
    }
  };

  // Example of fetching replies for a single review if you want the data always fresh
  const fetchRepliesForSingleReview = async (reviewId) => {
    try {
      const repliesQuery = query(
        collection(db, "replies"),
        where("reviewId", "==", reviewId)
      );
      const querySnapshot = await getDocs(repliesQuery);
      const fetchedReplies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRepliesByReview((prev) => ({ ...prev, [reviewId]: fetchedReplies }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  /** Submit a reply to a review */
  const submitReply = async (e, reviewId) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("Please login to reply.");
      return;
    }

    // Fetch the user's document
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let userName = "User";
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      userName = userData.name || "User";
    }

    try {
      await addDoc(collection(db, "replies"), {
        reviewId,
        adId,
        userId: auth.currentUser.uid,
        comment: replyText,
        createdAt: new Date(),
        userName: userName,
      });
      toast.success("Reply submitted!");
      setReplyText("");
      // Re-fetch for that single review only
      await fetchRepliesForSingleReview(reviewId);
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Failed to submit reply");
    }
  };

  /** Delete a reply */
  const deleteReply = async (reply, reviewId) => {
    if (auth.currentUser?.uid !== reply.userId) {
      toast.error("You are not authorized to delete this reply.");
      return;
    }
    const confirmDelete = window.confirm("Delete this reply?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "replies", reply.id));
      toast.success("Reply deleted!");
      fetchRepliesForSingleReview(reviewId);
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Failed to delete reply");
    }
  };

  /** Start editing a reply */
  const startEditingReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditingReplyText(reply.comment);
  };

  /** Cancel editing a reply */
  const cancelEditingReply = () => {
    setEditingReplyId(null);
    setEditingReplyText("");
  };

  /** Save edited reply */
  const saveEditedReply = async (reply, reviewId) => {
    if (auth.currentUser?.uid !== reply.userId) {
      toast.error("You are not authorized to edit this reply.");
      return;
    }
    try {
      await updateDoc(doc(db, "replies", reply.id), {
        comment: editingReplyText,
      });
      toast.success("Reply updated!");
      cancelEditingReply();
      fetchRepliesForSingleReview(reviewId);
    } catch (error) {
      console.error("Error editing reply:", error);
      toast.error("Failed to edit reply");
    }
  };

  return (
    <div className="mt-8">
      {/* REVIEWS HEADER & AVERAGE */}
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold mr-4">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center text-gray-700">
            <div className="inline-block mr-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="ml-1 text-sm font-medium">
              {averageRating.toFixed(1)} ★ ({reviews.length} review
              {reviews.length > 1 ? "s" : ""})
            </span>
          </div>
        )}
        {reviews.length === 0 && (
          <p className="ml-2 text-gray-500 text-sm">No reviews yet.</p>
        )}
      </div>

      {/* EXISTING REVIEWS */}
      {reviews.map((rev) => {
        const replies = repliesByReview[rev.id] || [];
        const isEditing = editingReviewId === rev.id;

        return (
          <div
            key={rev.id}
            className="border p-3 mb-4 rounded bg-white shadow-sm"
          >
            <div className="flex justify-between items-center mb-1">
              {/* Reviewer's name -> clickable link */}
              <p className="text-sm text-gray-800">
                <Link
                  to={`/profile/${rev.userId}`}
                  className="font-semibold hover:underline"
                >
                  {rev.userName}
                </Link>{" "}
                <span className="text-gray-500 text-xs ml-2">
                  {rev.createdAt?.seconds ? (
                    <Moment fromNow>{rev.createdAt.toDate()}</Moment>
                  ) : (
                    ""
                  )}
                </span>
              </p>

              {/* If current user is author, show Edit/Delete */}
              {auth.currentUser?.uid === rev.userId && (
                <div className="flex items-center space-x-3">
                  <button
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                    onClick={() =>
                      isEditing
                        ? cancelEditingReview()
                        : startEditingReview(rev)
                    }
                  >
                    {isEditing ? (
                      <>
                        <FaEdit className="mr-1" /> Cancel
                      </>
                    ) : (
                      <>
                        <FaEdit className="mr-1" /> Edit
                      </>
                    )}
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 flex items-center text-sm"
                    onClick={() => deleteReview(rev.id, rev.userId)}
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              )}
            </div>

            {/* EDITING MODE */}
            {isEditing ? (
              <div className="bg-gray-50 p-2 mt-2 rounded">
                <div className="flex items-center mb-2">
                  <span className="mr-2 text-sm font-medium text-gray-700">
                    Rating:
                  </span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setEditingReviewRating(num)}
                      >
                        {num <= editingReviewRating ? (
                          <AiFillStar className="text-yellow-400" size={20} />
                        ) : (
                          <AiOutlineStar className="text-yellow-400" size={20} />
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {editingReviewRating}/5
                  </span>
                </div>
                <textarea
                  className="w-full border rounded p-2 mb-2 text-sm"
                  rows="2"
                  value={editingReviewText}
                  onChange={(e) => setEditingReviewText(e.target.value)}
                />
                <button
                  onClick={() => saveEditedReview(rev.id, rev.userId)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                {/* NORMAL VIEW MODE */}
                <div className="flex items-center text-yellow-400 text-sm mb-1">
                  {renderStars(rev.rating || 0)}
                  {rev.rating ? (
                    <span className="text-gray-500 text-xs ml-2">
                      {rev.rating}/5
                    </span>
                  ) : null}
                </div>
                <p className="text-gray-700 text-sm mb-2">{rev.comment}</p>
              </>
            )}

            {/* REPLY BUTTON - show the correct count from repliesByReview */}
            <button
              className="mt-2 text-blue-500 hover:underline text-sm"
              onClick={() => toggleReplyForm(rev.id)}
            >
              {activeReplyForm === rev.id
                ? `Close Replies`
                : `Reply (${replies.length})`}
            </button>

            {/* REPLIES SECTION */}
            {activeReplyForm === rev.id && (
              <div className="reply-container mt-2 ml-4 pl-4 border-l border-gray-200">
                {replies.length > 0 ? (
                  replies.map((reply) => {
                    const isReplyEditing = editingReplyId === reply.id;
                    return (
                      <div
                        key={reply.id}
                        className="border p-2 my-1 rounded bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs text-gray-600">
                            <Link
                              to={`/profile/${reply.userId}`}
                              className="font-semibold hover:underline"
                            >
                              {reply.userName}
                            </Link>{" "}
                            {reply.createdAt?.seconds && (
                              <span className="ml-1">
                                <Moment fromNow>
                                  {reply.createdAt.toDate()}
                                </Moment>
                              </span>
                            )}
                          </p>
                          {/* If current user is author, show Edit/Delete */}
                          {auth.currentUser?.uid === reply.userId && (
                            <div className="flex items-center space-x-3">
                              <button
                                className="text-blue-500 hover:text-blue-700 text-xs flex items-center"
                                onClick={() =>
                                  isReplyEditing
                                    ? cancelEditingReply()
                                    : startEditingReply(reply)
                                }
                              >
                                {isReplyEditing ? (
                                  <>
                                    <FaEdit className="mr-1" /> Cancel
                                  </>
                                ) : (
                                  <>
                                    <FaEdit className="mr-1" /> Edit
                                  </>
                                )}
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700 flex items-center text-xs"
                                onClick={() => deleteReply(reply, rev.id)}
                              >
                                <FaTrash className="mr-1" /> Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {isReplyEditing ? (
                          <div className="bg-white p-2 rounded">
                            <textarea
                              className="w-full border rounded p-1 text-sm"
                              rows="1"
                              value={editingReplyText}
                              onChange={(e) => setEditingReplyText(e.target.value)}
                            />
                            <button
                              onClick={() => saveEditedReply(reply, rev.id)}
                              className="mt-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm">
                            {reply.comment}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">No replies yet.</p>
                )}

                {/* REPLY FORM */}
                <form onSubmit={(e) => submitReply(e, rev.id)} className="mt-2">
                  <textarea
                    className="w-full border rounded p-2 text-sm"
                    rows="2"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="mt-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                  >
                    Submit Reply
                  </button>
                </form>
              </div>
            )}
          </div>
        );
      })}

      {/* FORM TO SUBMIT A NEW REVIEW */}
      {auth.currentUser ? (
        <form onSubmit={submitReview} className="mt-4 bg-white p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
          <div className="flex items-center mb-2">
            <span className="mr-2 text-sm font-medium text-gray-700">
              Rating:
            </span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setReviewRating(num)}
                >
                  {num <= reviewRating ? (
                    <AiFillStar className="text-yellow-400" size={24} />
                  ) : (
                    <AiOutlineStar className="text-yellow-400" size={24} />
                  )}
                </button>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">
              {reviewRating}/5
            </span>
          </div>

          <textarea
            className="w-full border rounded p-2 mb-2"
            rows="3"
            placeholder="Share your experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Submit Review
          </button>
        </form>
      ) : (
        <p className="mt-2">
          Please{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            login
          </Link>{" "}
          to leave a review.
        </p>
      )}
    </div>
  );
};

export default ReviewSection;
