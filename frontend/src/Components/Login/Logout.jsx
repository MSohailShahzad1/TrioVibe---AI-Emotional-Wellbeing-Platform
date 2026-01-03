import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1️⃣ Remove token
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userRole");

    // 2️⃣ Show toast
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
    });

    // 3️⃣ Redirect to login after a short delay
    setTimeout(() => {
      navigate("/Login");
    }, 2000);
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300"
    >
      Logout
    </button>
  );
}
