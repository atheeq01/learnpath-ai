import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { useAuth } from "../hooks/useAuth";
import { loginFormSchema } from "../validators/authForms";
import { getApiError } from "../lib/apiError";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [form, setForm] = useState({
        identifier: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        setErrors({});
        setServerError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setErrors({});

        const result = loginFormSchema.safeParse(form);

        if (!result.success) {
            const fieldErrors = {};

            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);
            return;
        }

        try {
            setLoading(true);

            const user = await login(result.data);

            const redirectPath =
                user.role === "instructor"
                    ? "/instructor/dashboard"
                    : "/student/dashboard";

            navigate(redirectPath, { replace: true });
        } catch (error) {
            setServerError(getApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">

                <h1 className="text-3xl font-bold text-slate-900">
                    Welcome Back
                </h1>

                <p className="text-slate-500 mt-2 mb-6">
                    Login to your LearnPath AI account
                </p>

                {location.state?.registered && (
                    <p className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
                        Registration successful. Please login.
                    </p>
                )}

                {serverError && (
                    <p role="alert" className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                        {serverError}
                    </p>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">

                    <div>
                        <label htmlFor="identifier" className="block font-medium mb-1">
                            Username or Email
                        </label>

                        <input
                            id="identifier"
                            type="text"
                            name="identifier"
                            value={form.identifier}
                            onChange={handleChange}
                            autoComplete="username"
                            className="w-full border rounded-lg px-4 py-3"
                            placeholder="Enter username or email"
                        />

                        {errors.identifier && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.identifier}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block font-medium mb-1">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            className="w-full border rounded-lg px-4 py-3"
                            placeholder="Enter password"
                        />

                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="text-center mt-6 text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-indigo-600 font-semibold">
                        Register
                    </Link>
                </p>

            </div>
        </main>
    );
}