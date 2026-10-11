import { Link, NavLink, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function DashboardLayout() {
  const { user } = useAuth();

  const isInstructor = user.role === "instructor";

  const dashboardPath = isInstructor
    ? "/instructor/dashboard"
    : "/student/dashboard";

  const navStyle = ({ isActive }) =>
    `block px-4 py-3 rounded-lg ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div className="max-w-7xl mx-auto min-h-[85vh] flex flex-col md:flex-row">

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-5">
        <h2 className="text-xl font-bold mb-6">
          {isInstructor ? "Instructor Panel" : "Student Panel"}
        </h2>

        <nav className="space-y-2">
          <NavLink to={dashboardPath} className={navStyle}>
            Dashboard
          </NavLink>

          <NavLink to="/courses" className={navStyle}>
            Explore Courses
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <p className="text-sm text-slate-500">
            {isInstructor ? "Instructor Workspace" : "Student Workspace"}
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            Welcome, {user.name}!
          </h1>
        </div>

        <Outlet />
      </main>
    </div>
  );
}