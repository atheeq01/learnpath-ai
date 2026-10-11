import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { AuthContext } from "../context/authContext";
import api from "../services/api";
import { getApiError } from "../services/apiError";
import CourseCard from "../components/CourseCard";

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadEnrollments() {
      try {
        const { data } = await api.get("/enrollments/me", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setEnrollments(data.enrollments);
      } catch (error) {
        if (!controller.signal.aborted) setError(getApiError(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadEnrollments();
    return () => controller.abort();
  }, []);

  const activeEnrollments = enrollments.filter(
    (item) =>
      item.status === "enrolled" && item.courseId && !item.courseId.isDeleted,
  );
  return (
    <div className="space-y-7">
      <div>
        <h1>Welcome back, {user.name.split(" ")[0]}.</h1>
        <p className="mt-2 text-sm text-pine-700">
          Your courses and recent enrollments.
        </p>
      </div>
      <div className="flex flex-wrap gap-5 border-y border-pine-700/20 py-4 text-sm">
        <Link className="text-link" to="/courses">
          Browse courses
        </Link>
        <Link className="text-link" to="/student/my-courses">
          Enrollment history
        </Link>
        <Link className="text-link" to="/student/ai-advisor">
          Ask the AI advisor
        </Link>
      </div>
      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h2>My courses</h2>
          <Link className="text-link text-sm" to="/student/my-courses">
            View all
          </Link>
        </div>
        {loading ? (
          <p className="loading-state" role="status">
            Loading your courses...
          </p>
        ) : error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : activeEnrollments.length ? (
          <div>
            {activeEnrollments.slice(0, 3).map((item) => (
              <CourseCard key={item._id} course={item.courseId} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No enrolled courses yet</h3>
            <p className="mt-2">Browse the catalog to find a course.</p>
            <Link to="/courses" className="button-primary mt-4">
              Explore courses
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
