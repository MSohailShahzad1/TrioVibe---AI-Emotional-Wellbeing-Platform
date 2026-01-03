import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddReview() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");

  const submitReview = async () => {
    if (!rating) return toast.error("Select a rating");

    try {
      await axios.post(
        `http://localhost:5000/api/appointment/review/${appointmentId}`,
        { rating, review },
        { withCredentials: true }
      );

      toast.success("Review submitted!");
      navigate("/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting review");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Submit Review</h1>

      <label className="block mb-2 font-medium">Rating</label>
      <select
        className="border p-3 w-full rounded-lg mb-4"
        onChange={(e) => setRating(e.target.value)}
      >
        <option value="">Choose rating</option>
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>
            {r} Star{r > 1 && "s"}
          </option>
        ))}
      </select>

      <textarea
        className="border p-3 w-full rounded-lg h-32"
        placeholder="Write your review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />

      <button
        onClick={submitReview}
        className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        Submit
      </button>
    </div>
  );
}
