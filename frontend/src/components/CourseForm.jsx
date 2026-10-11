import { useState } from "react";
import { Link } from "react-router";
import { courseFormSchema } from "../validators/courseForms";

export default function CourseForm({
  initialValues = {},
  onSubmit,
  busy = false,
}) {
  const [form, setForm] = useState({
    title: initialValues.title ?? "",
    description: initialValues.description ?? "",
    content: initialValues.content ?? "",
    category: initialValues.category ?? "",
    level: initialValues.level ?? "beginner",
  });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    const result = courseFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        if (!fieldErrors[issue.path[0]])
          fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-6">
      <fieldset disabled={busy} className="space-y-6">
        <legend className="mb-5 text-lg font-semibold text-pine-950">
          Course information
        </legend>
        {[
          {
            name: "title",
            label: "Course title",
            placeholder: "e.g. A practical introduction to React",
            maxLength: 120,
          },
          {
            name: "description",
            label: "Short description",
            placeholder:
              "What will students learn, and who is this course for?",
            maxLength: 1500,
            rows: 3,
          },
          {
            name: "content",
            label: "Course content",
            placeholder:
              "Add the lessons, resources, and instructions for your students.",
            maxLength: 10000,
            rows: 10,
          },
          {
            name: "category",
            label: "Category",
            placeholder: "e.g. Web Development",
            maxLength: 60,
          },
        ].map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            {field.rows ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={field.rows}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={
                  errors[field.name] ? `${field.name}-error` : undefined
                }
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={
                  errors[field.name] ? `${field.name}-error` : undefined
                }
              />
            )}
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
          <label htmlFor="level">Difficulty level</label>
          <select
            id="level"
            name="level"
            value={form.level}
            onChange={handleChange}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {errors.level && (
            <p className="field-error" role="alert">
              {errors.level}
            </p>
          )}
        </div>
      </fieldset>
      <p className="text-sm text-pine-700">
        Course content is publicly viewable. Publish only material you want to
        share with everyone.
      </p>
      <div className="flex flex-wrap gap-3 border-t border-pine-100/40 pt-5">
        <button type="submit" disabled={busy} className="button-primary">
          {busy
            ? "Saving..."
            : initialValues._id
              ? "Save changes"
              : "Publish course"}
        </button>
        {!busy && (
          <Link to="/instructor/courses" className="button-secondary">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
