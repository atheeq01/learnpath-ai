import { useContext } from "react";
import { NavLink, Outlet } from "react-router";
import { AuthContext } from "../context/authContext";

export default function DashboardLayout() {
  const { user } = useContext(AuthContext);
  const isInstructor = user.role === "instructor";
  const links = isInstructor
    ? [
        { to: "/instructor/dashboard", label: "Overview" },
        { to: "/instructor/courses", label: "My courses" },
        { to: "/instructor/courses/new", label: "Create course" },
      ]
    : [
        { to: "/student/dashboard", label: "Overview" },
        { to: "/student/my-courses", label: "My learning" },
        { to: "/student/ai-advisor", label: "AI advisor" },
      ];

  return (
    <div className="page-container grid items-start gap-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10">
      <aside className="border-b border-pine-700/20 pb-4 lg:min-h-96 lg:border-r lg:border-b-0 lg:pr-5">
        <p className="mb-4 px-3 text-xs font-semibold text-pine-700">
          {isInstructor ? "Instructor" : "Student"}
        </p>
        <nav
          aria-label="Workspace navigation"
          className="flex flex-wrap gap-1 lg:flex-col"
        >
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className="sidebar-link">
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/courses" className="sidebar-link">
            Explore courses
          </NavLink>
        </nav>
      </aside>
      <main id="main-content" className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
