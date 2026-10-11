import { Link } from "react-router";

export default function CourseCard({ course }) {
  return (
    <article className="flex flex-col justify-between gap-4 border-b border-pine-700/20 py-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="min-w-0 max-w-2xl">
        <p className="mb-2 text-xs text-pine-700">
          {course.category} <span aria-hidden="true">/</span>{" "}
          <span className="capitalize">{course.level}</span>
        </p>
        <h3 className="break-words">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-pine-700">
          {course.description}
        </p>
      </div>
      <Link
        to={`/courses/${course._id}`}
        className="text-link shrink-0 text-sm"
      >
        View course <span aria-hidden="true">&rarr;</span>
      </Link>
    </article>
  );
}
