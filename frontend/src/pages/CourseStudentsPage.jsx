import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";

import api from "../services/api";
import { getApiError } from "../services/apiError";

export default function CourseStudentsPage() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("enrolled");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      setCourse(null);
      setStudents([]);

      try {
        const [rosterRes, courseRes] = await Promise.all([
          api.get(`/instructor/courses/${id}/students`, {
            params: filter === "all" ? { status: "all" } : {},
            signal: controller.signal,
          }),

          api.get("/instructor/courses", {
            params: { includeArchived: "true" },
            signal: controller.signal,
          }),
        ]);

        const currentCourse = courseRes.data.courses.find(
          (item) => item._id === id,
        );

        if (!currentCourse) {
          setError("Course not found in your account.");
          return;
        }

        setCourse(currentCourse);
        setStudents(rosterRes.data.students);
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
  }, [id, filter]);

  const handleUnenroll = async (enrollment) => {
    const student = enrollment.studentId;

    if (!student?._id || busyId !== null) return;

    if (!window.confirm(`Unenroll ${student.name}?`)) {
      return;
    }

    setBusyId(enrollment._id);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.patch(
        `/instructor/courses/${id}/students/${student._id}/unenroll`,
      );

      setStudents((prev) => {
        const updated = prev.map((item) =>
          item._id === enrollment._id
            ? {
                ...item,
                status: "unenrolled",
                unenrolledAt: data.enrollment.unenrolledAt,
                history: data.enrollment.history,
              }
            : item,
        );

        return filter === "all"
          ? updated
          : updated.filter((item) => item.status === "enrolled");
      });

      setSuccess(data.message);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link className="text-link text-sm" to="/instructor/courses">
        Back to my courses
      </Link>
      <div>
        <h1>Student roster</h1>
        <p className="mt-3 break-words text-pine-700">
          {course?.title || "Manage enrollments and view student history."}
        </p>
      </div>
      <div className="max-w-xs">
        <label htmlFor="enrollment-filter">Show enrollments</label>
        <select
          id="enrollment-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          disabled={busyId !== null}
        >
          <option value="enrolled">Currently enrolled</option>
          <option value="all">All enrollment history</option>
        </select>
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
      {loading ? (
        <p className="loading-state" role="status">
          Loading students...
        </p>
      ) : !error && students.length === 0 ? (
        <div className="empty-state">
          <h3>No students to show</h3>
          <p className="mt-2 text-sm text-pine-700">
            Enrollments will appear here when students join your course.
          </p>
        </div>
      ) : (
        students.length > 0 && (
          <div className="overflow-x-auto rounded border border-pine-700/20 bg-white">
            <table className="w-full min-w-[600px]">
              <caption className="sr-only">
                Students and enrollment history for {course?.title}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((enrollment) => {
                  const student = enrollment.studentId;
                  return (
                    <tr key={enrollment._id}>
                      <td>
                        <p className="font-semibold text-pine-950">
                          {student?.name || "Deleted user"}
                        </p>
                        <p className="text-xs text-pine-700">
                          {student?.username}
                        </p>
                      </td>
                      <td className="break-all">
                        {student?.email || "Unavailable"}
                      </td>
                      <td>
                        <span
                          className={
                            enrollment.status === "enrolled"
                              ? "badge"
                              : "badge bg-pine-100/40 text-pine-800"
                          }
                        >
                          {enrollment.status}
                        </span>
                        {filter === "all" && enrollment.history?.length > 0 && (
                          <details className="mt-3">
                            <summary>History</summary>
                            {enrollment.history.map((event, index) => (
                              <p
                                className="mt-2 text-xs text-pine-700"
                                key={event._id || index}
                              >
                                {event.action} &middot;{" "}
                                {new Date(event.at).toLocaleDateString()}
                                {event.reason &&
                                  ` (${event.reason.replaceAll("_", " ")})`}
                              </p>
                            ))}
                          </details>
                        )}
                      </td>
                      <td>
                        {enrollment.status === "enrolled" &&
                        !course?.isDeleted &&
                        student?._id ? (
                          <button
                            className="button-danger"
                            onClick={() => handleUnenroll(enrollment)}
                            disabled={busyId !== null || loading}
                          >
                            {busyId === enrollment._id
                              ? "Removing..."
                              : "Unenroll"}
                          </button>
                        ) : (
                          <span className="text-pine-700">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
