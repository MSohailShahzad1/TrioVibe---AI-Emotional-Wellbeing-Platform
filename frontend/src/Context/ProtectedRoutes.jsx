import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext,jsx";

// const ProtectedRoute = ({ authenticated, children }) => {
//   if (!authenticated) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };
// export default ProtectedRoute;
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useUser();

  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;