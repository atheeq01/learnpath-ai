import { useEffect, useState } from "react";
import axios from "axios";
import api from "../lib/api";

export default function CoursePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchCourses = async () => {
            try {
                const { data } = await api.get("/courses", {
                    signal: controller.signal,
                });
                setCourses(data.courses)
            } catch (error) {
                if (axios.isCancel(error)) return;

                setError("Failed to load courses");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }
        fetchCourses();
        return () => controller.abort()
    }, []);

    if (loading) {
        return <p className="p-10 text-center">Loading courses...</p>;
    }
    if (error) {
        <p className="p-10 text-center text-red-500">{error}</p>
    }

    return (
        <main className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-slate-900">
                Explore Courses
            </h1>

            <p className="mt-2 mb-8 text-slate-500">
                Discover courses to build your skills.
            </p>

            {courses.length === 0 ? (
                <p>No courses available yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                        >
                            <span className="text-xs font-semibold text-indigo-600 uppercase">
                                {course.category}
                            </span>

                            <h2 className="text-xl font-bold mt-3 mb-2">
                                {course.title}
                            </h2>

                            <p className="text-slate-500 text-sm mb-5">
                                {course.description}
                            </p>

                            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">
                                {course.level}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

