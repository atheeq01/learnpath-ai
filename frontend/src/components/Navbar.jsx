import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { AuthContext } from "../context/authContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dashboardPath =
    user?.role === "instructor"
      ? "/instructor/dashboard"
      : "/student/dashboard";

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <header className="bg-pine-950 text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-pine-950"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 font-serif text-xl"
          onClick={() => setMenuOpen(false)}
        >
          <span
            aria-hidden="true"
            className="border border-pine-100/40 px-2 py-1 font-sans text-xs text-pine-100"
          >
            LP
          </span>
          LearnPath AI
        </Link>
        <button
          className="min-h-11 rounded border border-pine-100/40 px-3 text-sm sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Menu
        </button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={`${menuOpen ? "flex" : "hidden"} w-full flex-col gap-2 text-sm sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-6`}
        >
          <NavLink
            to="/courses"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `py-2 underline-offset-8 hover:underline ${isActive ? "text-pine-100 underline" : "text-white"}`
            }
          >
            Courses
          </NavLink>
          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="py-2 hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <span className="hidden max-w-32 truncate text-pine-100 lg:block">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="min-h-11 rounded border border-pine-100/40 px-3 hover:bg-pine-800"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="py-2 hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded bg-pine-100 px-4 py-2.5 font-medium text-pine-950 hover:bg-white"
                onClick={() => setMenuOpen(false)}
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
