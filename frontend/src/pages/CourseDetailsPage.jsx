import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";
import api from "../services/api";
import { getApiError } from "../services/apiError";
import { AuthContext } from "../context/authContext";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const request = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadCourse = async () => {
      setLoading(true);
      setEnrolling(false);
      setError("");
      setSuccess("");
      setCourse(null);
      setEnrollmentStatus(null);
      try {
        const { data } = await api.get(`/courses/${id}`, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setCourse(data.course);
        if (user?.role === "student") {
          const response = await api.get("/enrollments/me", {
            signal: controller.signal,
          });
          const enrollment = response.data.enrollments.find(
            (item) => item.courseId?._id === id,
          );
          if (!controller.signal.aborted)
            setEnrollmentStatus(enrollment?.status ?? null);
        }
      } catch (err) {
        if (controller.signal.aborted || axios.isCancel(err)) return;
        setError(
          err.response?.status === 404 ? "Course not found" : getApiError(err),
        );
        // Enrollment status must be known before offering enrollment.
        setEnrollmentStatus("unknown");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadCourse();
    return () => {
      controller.abort();
      request.current?.abort();
      request.current = null;
    };
  }, [id, user?.id, user?.role]);

  const handleEnroll = async () => {
    if (
      request.current ||
      user?.role !== "student" ||
      enrollmentStatus === "enrolled" ||
      enrollmentStatus === "unknown"
    )
      return;
    const controller = new AbortController();
    request.current = controller;
    setEnrolling(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post(
        "/enrollments",
        { courseId: id },
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      setEnrollmentStatus("enrolled");
      setSuccess(data.message);
    } catch (err) {
      if (controller.signal.aborted || axios.isCancel(err)) return;
      if (err.response?.status === 409) {
        setEnrollmentStatus("enrolled");
        setSuccess("You are already enrolled.");
      } else {
        setError(getApiError(err));
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setEnrolling(false);
      }
    }
  };

  if (loading)
    return (
      <main id="main-content" className="page-container">
        <p className="loading-state" role="status">
          Loading course...
        </p>
      </main>
    );
  if (!course)
    return (
      <main id="main-content" className="page-container space-y-4">
        <Link className="text-link" to="/courses">
          Back to courses
        </Link>
        <p className="error-message" role="alert">
          {error || "Course not found"}
        </p>
      </main>
    );

  return (
    <main id="main-content" className="page-container space-y-6">
      <Link className="text-link text-sm" to="/courses">
        Back to courses
      </Link>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="border-b border-pine-700/20 pb-6">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="badge">{course.category}</span>
              <span className="badge bg-pine-100/40 text-pine-800">
                {course.level}
              </span>
            </div>
            <h1 className="break-words">{course.title}</h1>
            <p className="mt-5 whitespace-pre-wrap break-words text-pine-700">
              {course.description}
            </p>
          </section>
          <section className="border-b border-pine-700/20 pb-6">
            <h2 className="mb-5">What you'll learn</h2>
            <div className="whitespace-pre-wrap break-words leading-8">
              {course.content}
            </div>
          </section>
        </div>
        <aside className="space-y-5 border border-pine-700/20 bg-pine-100/20 p-5 lg:sticky lg:top-6">
          <div>
            <h2 className="text-xl">Enrollment</h2>
          </div>
          <p className="text-sm text-pine-700">
            Add this course to My learning so you can find it later.
          </p>
          {!user ? (
            <Link
              className="button-primary w-full"
              to="/login"
              state={{ from: `/courses/${id}` }}
            >
              Log in to enroll
            </Link>
          ) : user.role === "student" ? (
            enrollmentStatus === "enrolled" ? (
              <div className="space-y-3">
                <p className="success-message" role="status">
                  You're enrolled in this course.
                </p>
                <Link
                  className="button-secondary w-full"
                  to="/student/my-courses"
                >
                  Go to my learning
                </Link>
              </div>
            ) : enrollmentStatus !== "unknown" ? (
              <button
                className="button-primary w-full"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling
                  ? "Enrolling..."
                  : enrollmentStatus === "unenrolled"
                    ? "Re-enroll in course"
                    : "Enroll in course"}
              </button>
            ) : (
              <button
                className="button-secondary w-full"
                onClick={() => window.location.reload()}
              >
                Retry enrollment check
              </button>
            )
          ) : (
            <p className="rounded bg-pine-100/20 p-4 text-sm">
              You're viewing this course as an instructor. Enrollment is
              available to student accounts.
            </p>
          )}
          {success && (
            <p className="success-message" role="status">
              {success}
            </p>
          )}
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
