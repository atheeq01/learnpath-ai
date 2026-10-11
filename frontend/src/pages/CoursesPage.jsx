import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";
import { getApiError } from "../services/apiError";
import { AuthContext } from "../context/authContext";
import CourseCard from "../components/CourseCard";

export default function CoursesPage() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchCourses() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/courses", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setCourses(data.courses);
      } catch (error) {
        if (!controller.signal.aborted) setError(getApiError(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchCourses();
    return () => controller.abort();
  }, [reload]);

  // The API returns the catalog; these filters only change what is displayed.
  const categories = [
    ...new Set(courses.map((course) => course.category)),
  ].sort();
  const filteredCourses = courses.filter(
    (course) =>
      (!level || course.level === level) &&
      (!category || course.category === category) &&
      `${course.title} ${course.description} ${course.category}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

  function clearFilters() {
    setSearch("");
    setLevel("");
    setCategory("");
  }

  return (
    <main id="main-content" className="page-container">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1>Courses</h1>
          <p className="mt-2 text-sm text-pine-700">
            Browse the catalog by topic or level.
          </p>
        </div>
        <Link
          className="text-link text-sm"
          to={
            user?.role === "instructor"
              ? "/instructor/courses/new"
              : "/student/ai-advisor"
          }
        >
          {user?.role === "instructor"
            ? "Create a course"
            : "Ask the AI advisor"}
        </Link>
      </div>
      <section id="course-catalog" aria-label="Course catalog">
        <div className="grid gap-4 border-y border-pine-700/20 bg-pine-100/20 px-4 py-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
          <div>
            <label htmlFor="course-search">Search courses</label>
            <input
              id="course-search"
              type="search"
              placeholder="Search by title or topic"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="course-category">Category</label>
            <select
              id="course-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="course-level">Level</label>
            <select
              id="course-level"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button className="button-secondary" onClick={clearFilters}>
            Reset
          </button>
        </div>
        {!loading && !error && (
          <p className="mt-6 text-xs text-pine-700" role="status">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"}
          </p>
        )}
        {loading ? (
          <p className="loading-state" role="status">
            Loading courses...
          </p>
        ) : error ? (
          <div className="error-message mt-6 space-y-3">
            <p role="alert">{error}</p>
            <button
              className="button-secondary"
              onClick={() => setReload(reload + 1)}
            >
              Try again
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="empty-state mt-5">
            <h3>
              {courses.length
                ? "No courses match your search"
                : "No courses available yet"}
            </h3>
            <p className="mt-2">
              {courses.length
                ? "Try another topic or reset your filters."
                : "Published courses will appear here."}
            </p>
            {courses.length > 0 && (
              <button className="button-secondary mt-4" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
