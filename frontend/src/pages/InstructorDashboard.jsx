import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { AuthContext } from "../context/authContext";
import api from "../services/api";
import { getApiError } from "../services/apiError";

export default function InstructorDashboard() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadCourses() {
      try {
        const { data } = await api.get("/instructor/courses", {
          params: { includeArchived: "true" },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setCourses(data.courses);
      } catch (error) {
        if (!controller.signal.aborted) setError(getApiError(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadCourses();
    return () => controller.abort();
  }, []);

  const activeCourses = courses.filter((course) => !course.isDeleted);
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1>Welcome back, {user.name.split(" ")[0]}.</h1>
          <p className="mt-2 text-sm text-pine-700">
            Manage your courses and student enrollments.
          </p>
        </div>
        <Link to="/instructor/courses/new" className="button-primary">
          Create course
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
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-4 border-y border-pine-700/20 py-5">
            {[
              ["Total courses", courses.length],
              ["Published", activeCourses.length],
              ["Archived", courses.length - activeCourses.length],
            ].map(([label, count]) => (
              <div key={label}>
                <dt className="text-xs text-pine-700">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-pine-950">
                  {count}
                </dd>
              </div>
            ))}
          </dl>
          <section>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h2>Recent courses</h2>
              <Link to="/instructor/courses" className="text-link text-sm">
                Manage all
              </Link>
            </div>
            {courses.length ? (
              <div>
                {courses.slice(0, 3).map((course) => (
                  <article
                    className="flex flex-wrap items-center justify-between gap-4 border-b border-pine-700/20 py-5"
                    key={course._id}
                  >
                    <div className="min-w-0">
                      <p className="mb-1 text-xs capitalize text-pine-700">
                        {course.isDeleted ? "Archived" : course.level}
                      </p>
                      <h3 className="break-words">{course.title}</h3>
                    </div>
                    <Link
                      to={`/instructor/courses/${course._id}/students`}
                      className="text-link text-sm"
                    >
                      View students
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No courses yet</h3>
                <p className="mt-2">
                  Create a course to add lessons and accept enrollments.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
