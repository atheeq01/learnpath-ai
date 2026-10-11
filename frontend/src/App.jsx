import { Navigate, Route, Routes } from "react-router";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import CoursesPage from "./pages/CoursesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";

import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-10 text-center">Loading...</p>;
  }

  const homePath =
    user?.role === "instructor"
      ? "/instructor/dashboard"
      : "/student/dashboard";

  return (
    <>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <Navigate
              to={user ? homePath : "/courses"}
              replace
            />
          }
        />

        <Route path="/courses" element={<CoursesPage />} />

        <Route
          path="/login"
          element={
            user
              ? <Navigate to={homePath} replace />
              : <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            user
              ? <Navigate to={homePath} replace />
              : <RegisterPage />
          }
        />

        {/* Student-only routes */}
        <Route
          element={<ProtectedRoute allowedRoles={["student"]} />}
        >
          <Route path="/student" element={<DashboardLayout />}>
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />
            <Route
              path="dashboard"
              element={<StudentDashboard />}
            />
          </Route>
        </Route>

        {/* Instructor-only routes */}
        <Route
          element={<ProtectedRoute allowedRoles={["instructor"]} />}
        >
          <Route path="/instructor" element={<DashboardLayout />}>
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />
            <Route
              path="dashboard"
              element={<InstructorDashboard />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={user ? homePath : "/courses"}
              replace
            />
          }
        />
      </Routes>
    </>
  );
}