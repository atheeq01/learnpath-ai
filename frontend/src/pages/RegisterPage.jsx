import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "../hooks/useAuth";
import { registerFormSchema } from "../validators/authForms";
import { getApiError } from "../lib/apiError";

const fields = [
  { name: "name", label: "Full Name", type: "text" },
  { name: "username", label: "Username", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Password", type: "password" },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

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

    setErrors({});
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

    // Do not send confirmPassword to backend
    const { confirmPassword, ...userData } = result.data;

    try {
      setLoading(true);

      await register(userData);

      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (error) {
      setServerError(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-sm border border-slate-200">

        <h1 className="text-3xl font-bold">
          Create Account
        </h1>

        <p className="text-slate-500 mt-2 mb-6">
          Join LearnPath AI and start learning
        </p>

        {serverError && (
          <p role="alert" className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block font-medium mb-1"
              >
                {field.label}
              </label>

              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                autoComplete={
                  field.name === "password" ||
                  field.name === "confirmPassword"
                    ? "new-password"
                    : field.name === "name"
                      ? "name"
                      : field.name
                }
                className="w-full border rounded-lg px-4 py-3"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />

              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          <div>
            <label htmlFor="role" className="block font-medium mb-1">
              Register As
            </label>

            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold">
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}