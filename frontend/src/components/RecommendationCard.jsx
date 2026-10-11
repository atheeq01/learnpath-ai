import { Link } from "react-router";

export default function RecommendationCard({ recommendation }) {
  const { course, reason } = recommendation;
  if (!course?._id) return null;

  return (
    <article className="border-l-2 border-pine-700 py-1 pl-4">
      <h3 className="break-words">{course.title}</h3>
      <p className="mt-1 text-xs capitalize text-pine-700">{course.level}</p>
      <p className="mt-2 text-sm text-pine-800">{course.description}</p>
      <p className="my-3 text-sm">
        <strong>Why this course: </strong>
        {reason}
      </p>
      <Link className="text-link text-sm" to={`/courses/${course._id}`}>
        View course
      </Link>
    </article>
  );
}
