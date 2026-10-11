import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { AuthContext } from "../context/authContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={
          user.role === "instructor"
            ? "/instructor/dashboard"
            : "/student/dashboard"
        }
        replace
      />
    );
  }
  return <Outlet />;
}
