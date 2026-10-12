import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  // Local storage se JWT token check karo
  const token = localStorage.getItem("token");

  // Token nahi hai toh Login page par bhejo
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token hai toh requested page render karo
  return <Outlet />;
}

export default ProtectedRoute;
