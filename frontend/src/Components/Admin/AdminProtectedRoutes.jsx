import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  const admin = localStorage.getItem("adminData");

  if (!token || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
