import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />; // Redirect to login if no token
  }

  return children;
};

export default ProtectedRoute;