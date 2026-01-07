


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
    <div className="min-h-full w-full p-6 animate-fade-in-up">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* TOP CARD */}
        <div className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="text-6xl w-32 h-32 flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
            {therapist.profile?.avatar || "👤"}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold text-bright tracking-tight mb-2">
              {therapist.profile?.fullName || therapist.name}
            </h1>
            <p className="text-cyan-500 font-bold uppercase tracking-widest text-sm">
              {therapist.therapyPreferences?.supportType || "Mental Health Specialist"}
            </p>

            <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-1 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                <FaStar className="text-yellow-400 text-sm" />
                <span className="font-bold text-yellow-400 text-sm">
                  {therapist.rating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <span className="text-dim text-sm font-medium">
                ({therapist.totalReviews || 0} Professional Reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Grid Layout for About and Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ABOUT */}
          <div className="glass-panel p-8">
            <h2 className="text-xl font-bold text-bright mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-cyan-500 rounded-full" />
              About Specialist
            </h2>
            <p className="text-auto leading-relaxed text-sm">
              {therapist.profile?.bio || "This therapist has not provided a detailed bio yet, but is available for consultation."}
            </p>
          </div>

          {/* EXPERIENCE */}
          <div className="glass-panel p-8">
            <h2 className="text-xl font-bold text-bright mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
              Expertise & Experience
            </h2>
            {therapist.experience?.length > 0 ? (
              <ul className="space-y-3">
                {therapist.experience.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2 text-auto text-sm">
                    <span className="text-cyan-500 mt-1">•</span>
                    {exp}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-dim text-sm italic">Clinical experience details coming soon.</p>
            )}
          </div>
        </div>

        {/* REVIEWS */}
        <div className="glass-panel p-8">
          <div
            className="flex justify-between items-center cursor-pointer group"
            onClick={() => setReviewsCollapsed(!reviewsCollapsed)}
          >
            <h2 className="text-xl font-bold text-bright flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              Client Testimonials
            </h2>
            <div className="p-2 rounded-lg bg-white/5 text-dim group-hover:text-bright transition-colors">
              {reviewsCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </div>
          </div>

          {!reviewsCollapsed && (
            <div className="mt-8 space-y-4 animate-fade-in-up">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-dim">No public reviews available yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="glass-card p-6 border-white/5"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg shadow-lg">
                          {review.user?.profile?.avatar || "👤"}
                        </div>
                        <div>
                          <p className="font-bold text-bright text-sm">
                            {review.user?.profile?.fullName || review.user?.name || "Anonymous User"}
                          </p>
                          <div className="flex items-center text-yellow-400 text-xs mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-white/10"} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-[10px] text-dim font-bold uppercase tracking-tighter">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-auto text-sm leading-relaxed italic pr-4">
                        "{review.review}"
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {hasMore && (
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchReviews(next);
                  }}
                  disabled={loadingReviews}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-bright font-bold hover:bg-white/10 transition-all"
                >
                  {loadingReviews ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : "Show More Experiences"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* BOOK BUTTON */}
        <button
          onClick={() => navigate(`/therapist/${id}/book`)}
          className="w-full py-5 rounded-2xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl hover:shadow-cyan-500/20 active:scale-[0.98] transition-all text-lg tracking-tight"
        >
          Initialize Booking Protocol
        </button>
      </div>
    </div>
  );
}
