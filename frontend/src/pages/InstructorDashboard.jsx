import { Link } from "react-router";

export default function InstructorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Instructor Dashboard
        </h2>

        <p className="text-slate-500 mt-2">
          Manage your courses and student enrollments.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-xl font-semibold">
            Course Management
          </h3>

          <p className="text-slate-500 mt-2 mb-5">
            Create, update and manage your courses.
          </p>

          <Link
            to="/courses"
            className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg"
          >
            View Courses
          </Link>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-xl font-semibold">
            Student Enrollments
          </h3>

          <p className="text-slate-500 mt-2">
            Your course rosters and enrolled students
            will be available here soon.
          </p>
        </div>
      </div>
    </div>
  );
}