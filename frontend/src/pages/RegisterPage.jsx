import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../context/authContext";
import { registerFormSchema } from "../validators/authForms";
import { getApiError } from "../services/apiError";
import AuthLayout from "../components/AuthLayout";

const fields = [
  {
    name: "name",
    label: "Full name",
    type: "text",
    autoComplete: "name",
    placeholder: "Your full name",
  },
  {
    name: "username",
    label: "Username",
    type: "text",
    autoComplete: "username",
    placeholder: "Choose a username",
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "At least 8 characters",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Enter your password again",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
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
    const result = registerFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    // Confirmation is checked in the browser; the API only accepts these fields.
    const { name, username, email, password, role } = result.data;
    setLoading(true);
    try {
      await register({ name, username, email, password, role });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (error) {
      setServerError(getApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Register as a student or an instructor."
    >
      {serverError && (
        <p className="error-message mb-5" role="alert">
          {serverError}
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              {...field}
              id={field.name}
              value={form[field.name]}
              onChange={handleChange}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
            {errors[field.name] && (
              <p
                id={`${field.name}-error`}
                className="field-error"
                role="alert"
              >
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
        <div>
          <label htmlFor="role">I'm here to</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">Learn as a student</option>
            <option value="instructor">Teach as an instructor</option>
          </select>
          {errors.role && (
            <p className="field-error" role="alert">
              {errors.role}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="button-primary w-full"
        >
          {loading ? "Creating your account..." : "Create account"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-pine-700">
        Already have an account?{" "}
        <Link className="text-link" to="/login">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
