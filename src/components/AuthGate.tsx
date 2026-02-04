import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGate() {
  const { user, loading } = useAuth();

  // Show nothing while checking auth
  if (loading) return null;

  // If not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in → render nested routes
  return <Outlet />;
}
