import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === "instructor"
      ? "/instructor/dashboard"
      : "/student/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-white border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">

        <Link
          to="/"
          className="text-2xl font-bold text-indigo-600"
        >
          LearnPath AI
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/courses">Courses</Link>

          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="text-indigo-600 font-medium"
              >
                Dashboard
              </Link>

              <span className="text-slate-500 text-sm">
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>

              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}