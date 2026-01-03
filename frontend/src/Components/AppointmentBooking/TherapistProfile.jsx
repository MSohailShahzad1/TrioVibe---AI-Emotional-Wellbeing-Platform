


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function TherapistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [reviewsCollapsed, setReviewsCollapsed] = useState(true); // toggle

  /* ---------------- LOAD THERAPIST ---------------- */
  useEffect(() => {
    const loadTherapist = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/therapist/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setTherapist(data.therapist || data);
      } catch (err) {
        console.error("Failed to load therapist profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadTherapist();
  }, [id]);

  /* ---------------- LOAD REVIEWS ---------------- */
  const fetchReviews = async (pageNum = 1) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/therapist/${id}/reviews?page=${pageNum}&limit=3`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setReviews((prev) =>
        pageNum === 1 ? data.reviews : [...prev, ...data.reviews]
      );
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };
  const [ratingData, setRatingData] = useState({ rating: 0, totalReviews: 0 });

useEffect(() => {
  const fetchRating = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/therapist/${id}/rating`);
      setRatingData(res.data);
    } catch (err) {
      console.error("Failed to fetch rating", err);
    }
  };

  fetchRating();
}, [id]);


  useEffect(() => {
    fetchReviews(1);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center text-white text-xl py-6">
        Loading profile...
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-full flex items-center justify-center text-red-400 text-xl py-6">
        Therapist not found.
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0d1b2a] via-[#1b263b] to-[#415a77] p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* TOP CARD */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="text-6xl w-28 h-28 flex items-center justify-center bg-white/10 rounded-2xl">
            {therapist.profile?.avatar || "👤"}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {therapist.profile?.fullName || therapist.name}
            </h1>
            <p className="text-gray-300 mt-1">
              {therapist.therapyPreferences?.supportType || "Therapist"}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <FaStar className="text-yellow-400" />
              <span className="font-semibold">
                {/* {therapist.rating?.toFixed(1) || "0.0"} / 5 */}
                {setRatingData}
              </span>
              <span className="text-gray-400 text-sm">
                ({therapist.totalReviews || 0} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-3">About</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {therapist.profile?.bio || "No bio available."}
          </p>
        </div>

        {/* EXPERIENCE */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-3">Experience</h2>
          {therapist.experience?.length > 0 ? (
            <ul className="space-y-2 text-gray-300 text-sm">
              {therapist.experience.map((exp, i) => (
                <li key={i}>• {exp}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No experience added yet.</p>
          )}
        </div>

        {/* REVIEWS */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setReviewsCollapsed(!reviewsCollapsed)}
          >
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
            {reviewsCollapsed ? <FaChevronDown /> : <FaChevronUp />}
          </div>

          {reviewsCollapsed ? null : (
            <div className="max-h-96 overflow-y-auto">
              {reviews.length === 0 ? (
                <p className="text-gray-400">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {review.user?.profile?.avatar || "👤"}
                      </div>
                      <p className="font-semibold">
                        {review.user?.profile?.fullName || review.user?.name || "Anonymous"}
                      </p>
                    </div>

                    <div className="flex items-center text-yellow-400 my-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <FaStar key={i} />
                      ))}
                    </div>

                    <p className="text-gray-300 text-sm">{review.review}</p>

                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}

              {hasMore && (
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchReviews(next);
                  }}
                  disabled={loadingReviews}
                  className="w-full mt-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
                >
                  {loadingReviews ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* BOOK BUTTON */}
        <button
          onClick={() => navigate(`/therapist/${id}/book`)}
          className="w-full py-4 rounded-2xl font-semibold bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 transition"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}
