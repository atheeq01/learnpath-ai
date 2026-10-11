import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AuthContext } from "./context/authContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorCoursesPage from "./pages/InstructorCoursesPage";
import CourseEditorPage from "./pages/CourseEditorPage";
import CourseStudentsPage from "./pages/CourseStudentsPage";
import AIAdvisorPage from "./pages/AIAdvisorPage";
import HomePage from "./pages/HomePage";

export default function App() {
  const { user, loading, authError, logout } = useContext(AuthContext);
  const homePath =
    user?.role === "instructor"
      ? "/instructor/dashboard"
      : "/student/dashboard";

  if (loading)
    return (
      <main className="page-container">
        <p className="loading-state" role="status">
          Restoring your session...
        </p>
      </main>
    );
  if (authError) {
    return (
      <main className="page-container max-w-lg space-y-4">
        <h1>We couldn't restore your session</h1>
        <p className="error-message" role="alert">
          {authError}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            className="button-primary"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
          <button className="button-secondary" onClick={logout}>
            Continue signed out
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/register"
            element={
              user ? <Navigate to={homePath} replace /> : <RegisterPage />
            }
          />
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<DashboardLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="my-courses" element={<MyCoursesPage />} />
              <Route path="ai-advisor" element={<AIAdvisorPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
            <Route path="/instructor" element={<DashboardLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InstructorDashboard />} />
              <Route path="courses" element={<InstructorCoursesPage />} />
              {/* Separate keys reset editor state when switching from edit to create. */}
              <Route
                path="courses/new"
                element={<CourseEditorPage key="create" />}
              />
              <Route
                path="courses/:id/edit"
                element={<CourseEditorPage key="edit" />}
              />
              <Route
                path="courses/:id/students"
                element={<CourseStudentsPage />}
              />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <main id="main-content" className="page-container">
                <div className="empty-state">
                  <h1>Page not found</h1>
                  <p className="mt-3">
                    Use the navigation above to open a page.
                  </p>
                </div>
              </main>
            }
          />
        </Routes>
      </div>
      <footer className="border-t border-pine-700/20 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-xs text-pine-700 sm:px-6 lg:px-8">
          <span className="font-semibold text-pine-800">LearnPath AI</span>
        </div>
      </footer>
    </div>
  );
}
