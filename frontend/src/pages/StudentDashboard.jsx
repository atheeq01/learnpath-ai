import { Link } from "react-router";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Student Dashboard
        </h2>

        <p className="text-slate-500 mt-2">
          Discover courses and build your learning path.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-xl font-semibold">
            Explore Courses
          </h3>

          <p className="text-slate-500 mt-2 mb-5">
            Find courses that match your career goals.
          </p>

          <Link
            to="/courses"
            className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg"
          >
            Browse Courses
          </Link>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-xl font-semibold">
            My Learning
          </h3>

          <p className="text-slate-500 mt-2">
            Your enrolled courses and AI learning
            recommendations will appear here soon.
          </p>
        </div>
      </div>
    </div>
  );
}