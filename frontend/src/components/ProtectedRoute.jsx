import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <p className="p-10 text-center">
        Checking authentication...
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    const path =
      user.role === "instructor"
        ? "/instructor/dashboard"
        : "/student/dashboard";

    return <Navigate to={path} replace />;
  }

  return <Outlet />;
}