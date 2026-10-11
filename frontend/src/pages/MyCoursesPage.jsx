import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";
import { getApiError } from "../services/apiError";

function EnrollmentCard({ enrollment }) {
  const course = enrollment.courseId;
  const archived = course?.isDeleted === true;
  const active = enrollment.status === "enrolled" && course && !archived;
  return (
    <article className="border-b border-pine-700/20 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="break-words">{course?.title || "Course unavailable"}</h3>
        <span
          className={active ? "badge" : "badge bg-pine-100/40 text-pine-800"}
        >
          {archived ? "Archived" : enrollment.status}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-pine-700">
        {course?.description ||
          "This course is no longer available. Your enrollment history is saved below."}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-pine-700">
        <p>
          First enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
        </p>
        {enrollment.unenrolledAt && (
          <p>
            Unenrolled: {new Date(enrollment.unenrolledAt).toLocaleDateString()}
          </p>
        )}
      </div>
      {active && (
        <Link className="button-secondary mt-5" to={`/courses/${course._id}`}>
          Continue learning →
        </Link>
      )}
      {enrollment.history?.length > 0 && (
        <details className="mt-5 border-t border-pine-100/40 pt-4">
          <summary>Enrollment history</summary>
          <ul className="mt-3 space-y-2">
            {enrollment.history.map((event, index) => (
              <li className="text-xs text-pine-700" key={event._id || index}>
                <span className="capitalize">{event.action}</span> ·{" "}
                {new Date(event.at).toLocaleString()}
                {event.reason && ` (${event.reason.replaceAll("_", " ")})`}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

export default function MyCoursesPage() {
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

  const active = enrollments.filter(
    (item) =>
      item.status === "enrolled" && item.courseId && !item.courseId.isDeleted,
  );
  const history = enrollments.filter((item) => !active.includes(item));
  return (
    <div className="space-y-8">
      <div>
        <h1>My learning</h1>
        <p className="mt-3 text-pine-700">
          View your current courses and enrollment history.
        </p>
      </div>
      {loading ? (
        <p className="loading-state" role="status">
          Loading your courses...
        </p>
      ) : error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : enrollments.length === 0 ? (
        <div className="empty-state">
          <h2>No enrolled courses yet</h2>
          <p className="mb-5 mt-3 text-sm text-pine-700">
            Browse the catalog to find a course.
          </p>
          <Link to="/courses" className="button-primary">
            Explore courses →
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2>
              Enrolled courses{" "}
              <span className="ml-2 text-lg text-pine-700">
                {active.length}
              </span>
            </h2>
            {active.length ? (
              active.map((enrollment) => (
                <EnrollmentCard key={enrollment._id} enrollment={enrollment} />
              ))
            ) : (
              <p className="empty-state">
                No active enrollments.{" "}
                <Link className="text-link" to="/courses">
                  Explore courses
                </Link>
              </p>
            )}
          </section>
          {history.length > 0 && (
            <section className="space-y-4">
              <h2>Past enrollments</h2>
              {history.map((enrollment) => (
                <EnrollmentCard key={enrollment._id} enrollment={enrollment} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
