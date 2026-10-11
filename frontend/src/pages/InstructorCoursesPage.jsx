import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";

import api from "../services/api";
import { getApiError } from "../services/apiError";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [archivingId, setArchivingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const { data } = await api.get("/instructor/courses", {
          params: { includeArchived: "true" },
          signal: controller.signal,
        });

        setCourses(data.courses);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(getApiError(err));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const handleArchive = async (course) => {
    if (archivingId !== null) return;
    const confirmed = window.confirm(
      `Archive "${course.title}"? Active students will be unenrolled, but history will be preserved.`,
    );

    if (!confirmed) return;

    setArchivingId(course._id);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.delete(`/courses/${course._id}`);

      setCourses((prev) =>
        prev.map((item) =>
          item._id === course._id ? { ...item, isDeleted: true } : item,
        ),
      );

      setSuccess(
        `${data.message} ${data.unenrolledCount ?? 0} student(s) unenrolled.`,
      );
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setArchivingId(null);
    }
  };

  if (loading)
    return (
      <p className="loading-state" role="status">
        Loading your courses...
      </p>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>My courses</h1>
          <p className="mt-3 text-pine-700">
            Manage your content and the students learning with you.
          </p>
        </div>
        <Link className="button-primary" to="/instructor/courses/new">
          + Create course
        </Link>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success-message" role="status">
          {success}
        </p>
      )}
      {!error && courses.length === 0 && (
        <div className="empty-state">
          <h3>No courses yet</h3>
          <p className="mt-2 text-sm text-pine-700">
            Create a course to add content and accept enrollments.
          </p>
        </div>
      )}
      <div className="space-y-4">
        {courses.map((course) => (
          <article
            key={course._id}
            className="border-b border-pine-700/20 py-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="break-words text-xl">{course.title}</h2>
              <span
                className={
                  course.isDeleted
                    ? "badge bg-pine-100/40 text-pine-800"
                    : "badge"
                }
              >
                {course.isDeleted ? "Archived" : "Published"}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-pine-700">
              {course.description}
            </p>
            <p className="mt-3 text-xs font-semibold capitalize text-pine-700">
              {course.category} &middot; {course.level}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 border-t border-pine-100/40 pt-5">
              {!course.isDeleted && (
                <>
                  <Link
                    className="button-secondary"
                    to={`/instructor/courses/${course._id}/edit`}
                  >
                    Edit course
                  </Link>
                  <button
                    className="button-danger"
                    onClick={() => handleArchive(course)}
                    disabled={archivingId !== null}
                  >
                    {archivingId === course._id ? "Archiving..." : "Archive"}
                  </button>
                </>
              )}
              <Link
                className="button-secondary sm:ml-auto"
                to={`/instructor/courses/${course._id}/students`}
              >
                View students
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
