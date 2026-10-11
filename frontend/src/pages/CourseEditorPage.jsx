import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import axios from "axios";

import CourseForm from "../components/CourseForm";
import api from "../services/api";
import { getApiError } from "../services/apiError";
import { AuthContext } from "../context/authContext";

export default function CourseEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isEditing = Boolean(id);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const loadCourse = async () => {
      setLoading(true);
      setError("");
      setCourse(null);

      try {
        const { data } = await api.get(`/courses/${id}`, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        if (data.course.instructorId !== user.id) {
          setError("You do not own this course.");
          return;
        }

        setCourse(data.course);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(getApiError(err));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadCourse();
    return () => controller.abort();
  }, [id, user.id]);

  const handleSave = async (values) => {
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      if (isEditing) {
        await api.patch(`/courses/${id}`, values);
      } else {
        await api.post("/courses", values);
      }

      navigate("/instructor/courses", { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <p className="loading-state" role="status">
        Loading course...
      </p>
    );

  if (isEditing && !course) {
    return (
      <p className="error-message" role="alert">
        {error || "Course not found"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Link className="text-link text-sm" to="/instructor/courses">
        Back to my courses
      </Link>
      <div>
        <h1>{isEditing ? "Edit course" : "Create course"}</h1>
        <p className="mt-3 text-pine-700">
          {isEditing
            ? "Update the course details below."
            : "Add the course details and lesson content below."}
        </p>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <CourseForm
        key={id || "new"}
        initialValues={course || {}}
        onSubmit={handleSave}
        busy={busy}
      />
    </div>
  );
}
