import { useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "../context/authContext";

export default function HomePage() {
  const { user } = useContext(AuthContext);
  const dashboardPath =
    user?.role === "instructor"
      ? "/instructor/dashboard"
      : "/student/dashboard";

  return (
    <main id="main-content" className="page-container">
      <section className="max-w-2xl py-4 sm:py-8">
        <h1>{user ? `Welcome back, ${user.name.split(" ")[0]}.` : "Learn something new."}</h1>
        <p className="mt-3 text-sm text-pine-700">
          Browse courses, build your skills, and keep track of your learning.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="button-primary" to={user ? dashboardPath : "/courses"}>
            {user ? "Go to dashboard" : "Browse courses"}
          </Link>
          {!user && (
            <Link className="button-secondary" to="/register">
              Create an account
            </Link>
          )}
        </div>
      </section>

      <section className="mt-8 max-w-3xl border-y border-pine-700/20 py-6">
        <h2>Get started</h2>
        <div className="mt-4 divide-y divide-pine-700/20">
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <h3>Browse the course catalog</h3>
              <p className="mt-1 text-sm text-pine-700">
                Find courses by topic and level.
              </p>
            </div>
            <Link className="text-link text-sm" to="/courses">
              View courses <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <h3>{user ? "Continue learning" : "Your learning dashboard"}</h3>
              <p className="mt-1 text-sm text-pine-700">
                {user
                  ? "See your courses and learning activity."
                  : "Keep your enrolled courses together in one place."}
              </p>
            </div>
            <Link className="text-link text-sm" to={user ? dashboardPath : "/register"}>
              {user ? "Open dashboard" : "Get started"} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
