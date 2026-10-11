import { useContext, useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { AuthContext } from "../context/authContext";
import { loginFormSchema } from "../validators/authForms";
import { getApiError } from "../services/apiError";
import AuthLayout from "../components/AuthLayout";

export default function LoginPage() {
  const location = useLocation();
  const { login, user } = useContext(AuthContext);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
    setServerError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setServerError("");
    const result = loginFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(result.data);
    } catch (error) {
      setServerError(getApiError(error));
    } finally {
      setLoading(false);
    }
  }

  // One redirect handles both a new login and an already signed-in visitor.
  if (user) {
    const homePath =
      user.role === "instructor"
        ? "/instructor/dashboard"
        : "/student/dashboard";
    const from = location.state?.from;
    const canReturn =
      typeof from === "string" &&
      (from.startsWith("/courses/") || from.startsWith(`/${user.role}/`));
    return <Navigate to={canReturn ? from : homePath} replace />;
  }

  return (
    <AuthLayout
      title="Log in"
      description="Enter your details to access your account."
    >
      {location.state?.registered && (
        <p className="success-message mb-5" role="status">
          Your account is ready. Log in to get started.
        </p>
      )}
      {serverError && (
        <p className="error-message mb-5" role="alert">
          {serverError}
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="identifier">Username or email</label>
          <input
            id="identifier"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            autoComplete="username"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={
              errors.identifier ? "identifier-error" : undefined
            }
          />
          {errors.identifier && (
            <p id="identifier-error" className="field-error" role="alert">
              {errors.identifier}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="field-error" role="alert">
              {errors.password}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="button-primary w-full"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-pine-700">
        New to LearnPath AI?{" "}
        <Link className="text-link" to="/register">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
