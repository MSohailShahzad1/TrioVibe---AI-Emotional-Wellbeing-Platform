import { useEffect, useState } from "react";
import { therapistAPI } from "../../services/api.js";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { FaFileLines } from "react-icons/fa6";

export default function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [supportType, setSupportType] = useState("all");
  const [rating, setRating] = useState("all");

  useEffect(() => {
    const loadTherapists = async () => {
      try {
        const res = await therapistAPI.getAllTherapists();
        const list = res?.therapists || [];
        setTherapists(list);
        setFiltered(list);
      } catch (err) {
        console.error("Failed to load therapists:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTherapists();
  }, []);

  // Apply Filters
  useEffect(() => {
    let list = [...therapists];

    // Search by name
    if (search.trim() !== "") {
      list = list.filter((t) =>
        (t.profile?.fullName || t.name)
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Filter by support type
    if (supportType !== "all") {
      list = list.filter(
        (t) =>
          t.therapyPreferences?.supportType?.toLowerCase() ===
          supportType.toLowerCase()
      );
    }

    // Filter by rating
    if (rating !== "all") {
      list = list.filter((t) => t.rating >= Number(rating));
    }

    setFiltered(list);
  }, [search, supportType, rating, therapists]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-auto text-xl py-6 animate-fade-in-up">
        Loading therapists...
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen p-10 w-full animate-fade-in-up
      "
    >
      <h1 className="text-4xl font-bold text-center mb-10 gradient-text">
        Find Your Therapist
      </h1>

      {/* Search + Filter Bar */}
      <div
        className="
          max-w-5xl mx-auto mb-12 
          glass-panel p-6
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Search */}
          <div>
            <label className="text-sm text-dim font-bold uppercase tracking-wider">Search</label>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                  backdrop-blur-lg focus:outline-none text-white
                "
              />
              <FaSearch className="absolute right-4 top-3 text-gray-300" />
            </div>
          </div>

          {/* Filter by Support Type */}
          <div>
            <label className="text-sm text-dim font-bold uppercase tracking-wider">Support Type</label>
            <select
              value={supportType}
              onChange={(e) => setSupportType(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 
                backdrop-blur-lg focus:outline-none text-white
              "
            >
              <option value="all">All</option>
              <option value="peer-support">Peer Support</option>
              <option value="therapy">Therapy</option>
              <option value="counseling">Counseling</option>
            </select>
          </div>

          {/* Filter by Rating */}
          <div>
            <label className="text-sm text-dim font-bold uppercase tracking-wider">Minimum Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 
                backdrop-blur-lg focus:outline-none text-white
              "
            >
              <option value="all">All Ratings</option>
              <option value="1">⭐ 1+</option>
              <option value="2">⭐ 2+</option>
              <option value="3">⭐ 3+</option>
              <option value="4">⭐ 4+</option>
              <option value="5">⭐ 5 Only</option>
            </select>
          </div>
        </div>
      </div>
      <div className="new-chat">
        <Link to="/appointments" className="flex items-center gap-2">
          <FaFileLines className="text-xl text-gray-300" />
          <p>Appointments in Progress</p>
        </Link>
      </div>
      {/* Therapist Cards */}
      {filtered.length === 0 ? (
        <p className="text-center text-dim">No therapists found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((t) => (
            <div
              key={t._id}
              className="
                glass-card p-6 hover:-translate-y-2 hover:shadow-2xl
              "
            >
              {/* Avatar */}
              <div className="text-6xl text-center mb-4">
                {t.profile?.avatar || "👤"}
              </div>

              {/* Name */}
              <h2 className="text-2xl font-semibold text-center text-bright">
                {t.profile?.fullName || t.name}
              </h2>

              {/* Support Type */}
              <p className="text-dim text-center mt-1 font-medium">
                {t.therapyPreferences?.supportType || "General Support"}
              </p>

              {/* Rating */}
              <p className="text-yellow-300 text-center mt-3">
                ⭐ {t.rating} ({t.totalReviews} reviews)
              </p>

              {/* Button */}
              <Link to={`/therapist/${t._id}`}>
                <button
                  className="
                    mt-5 w-full py-3 rounded-xl font-bold
                    bg-gradient-to-br from-cyan-500 to-blue-600
                    hover:from-cyan-400 hover:to-blue-500 transition shadow-lg active:scale-95 text-white
                  "
                >
                  View Profile
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
