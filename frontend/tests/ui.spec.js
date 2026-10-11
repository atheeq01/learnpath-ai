import { test, expect } from "@playwright/test";

const course = {
  _id: "111111111111111111111111",
  title: "React for curious minds",
  description:
    "Build useful interfaces with components, state, and a practical approach to learning.",
  content:
    "Start with components.\nThen build your first interactive application.",
  category: "Web Development",
  level: "beginner",
  instructorId: "222222222222222222222222",
};
const secondCourse = {
  ...course,
  _id: "444444444444444444444444",
  title: "Data science foundations",
  category: "Data Science",
  level: "intermediate",
};
const student = {
  id: "333333333333333333333333",
  name: "Alex Learner",
  username: "alex",
  email: "alex@example.test",
  role: "student",
};
const instructor = {
  ...student,
  id: course.instructorId,
  name: "Jamie Instructor",
  role: "instructor",
};
const enrollment = {
  _id: "555555555555555555555555",
  courseId: course,
  studentId: { ...student, _id: student.id },
  status: "enrolled",
  enrolledAt: "2026-01-01T12:00:00Z",
  history: [
    {
      action: "enrolled",
      at: "2026-01-01T12:00:00Z",
      reason: "student_enrollment",
    },
  ],
};

// Mock only network responses. All pages, forms, routing, and Axios run normally.
async function setupApi(
  page,
  {
    user = null,
    courses = [course, secondCourse],
    enrollments = [],
    handler,
  } = {},
) {
  const requests = [];
  if (user)
    await page.addInitScript(() =>
      sessionStorage.setItem("token", "browser-test-token"),
    );
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api", "");
    const body = request.postDataJSON();
    requests.push({
      path,
      method: request.method(),
      body,
      authorization: request.headers().authorization,
    });
    const reply = (json, status = 200) => route.fulfill({ status, json });
    if (handler && (await handler({ path, request, body, reply }))) return;
    if (path === "/auth/me") return reply({ user });
    if (path === "/auth/login")
      return reply({ user: student, token: "login-test-token" });
    if (path === "/auth/register") return reply({ success: true }, 201);
    if (path === "/courses") return reply({ courses });
    if (path === `/courses/${course._id}`) return reply({ course });
    if (path === "/enrollments/me") return reply({ enrollments });
    if (path === "/enrollments")
      return reply({ message: "Enrollment successful", enrollment }, 201);
    if (path === "/instructor/courses") return reply({ courses: [course] });
    if (path.endsWith("/students")) return reply({ students: [enrollment] });
    if (path.endsWith("/unenroll"))
      return reply({
        message: "Student unenrolled successfully",
        enrollment: {
          ...enrollment,
          status: "unenrolled",
          unenrolledAt: "2026-02-01T12:00:00Z",
        },
      });
    if (path === "/ai/recommendations")
      return reply({
        reply: "Here is a course for your goal.",
        recommendations: [
          {
            courseId: course._id,
            course,
            reason: "A practical introduction to React.",
          },
        ],
      });
    return reply({ message: "Unexpected test endpoint: " + path }, 500);
  });
  return requests;
}

async function expectNoOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test("catalog search, filters, reset, and responsive layout", async ({
  page,
}, testInfo) => {
  await setupApi(page);
  await page.goto("/courses");
  await expect(page.getByRole("heading", { name: course.title })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("catalog.png"),
    fullPage: true,
  });
  await expectNoOverflow(page);
  await page.getByLabel("Search courses").fill("missing topic");
  await expect(page.getByText("No courses match your search")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Level", { exact: true }).selectOption("intermediate");
  await expect(
    page.getByRole("heading", { name: secondCourse.title }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: course.title })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(2);
});

test("catalog handles a failed request, retry, and empty data", async ({
  page,
}) => {
  let failing = true;
  await setupApi(page, {
    handler: async ({ path, reply }) => {
      if (path !== "/courses") return false;
      await reply(
        failing
          ? { message: "Service temporarily unavailable" }
          : { courses: [] },
        failing ? 503 : 200,
      );
      return true;
    },
  });
  await page.goto("/courses");
  await expect(page.getByRole("alert")).toContainText(
    "Service temporarily unavailable",
  );
  failing = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("No courses available yet")).toBeVisible();
});

test("registration validates passwords and sends only backend fields", async ({
  page,
}) => {
  const requests = await setupApi(page);
  await page.goto("/register");
  await expectNoOverflow(page);
  await page.getByLabel("Full name").fill("Alex Learner");
  await page.getByLabel("Username", { exact: true }).fill("Alex");
  await page.getByLabel("Email address").fill("alex@example.test");
  await page.getByLabel("Password", { exact: true }).fill("sample-password");
  await page.getByLabel("Confirm password").fill("different-password");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Passwords do not match");
  expect(
    requests.filter((item) => item.path === "/auth/register"),
  ).toHaveLength(0);
  await page.getByLabel("Confirm password").fill("sample-password");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Your account is ready");
  const submission = requests.find((item) => item.path === "/auth/register");
  expect(submission.body).toEqual({
    name: "Alex Learner",
    username: "alex",
    email: "alex@example.test",
    password: "sample-password",
    role: "student",
  });
});

test("login returns to a protected destination and logout clears authentication", async ({
  page,
}) => {
  const requests = await setupApi(page);
  await page.goto("/student/ai-advisor");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Username or email").fill("alex");
  await page.getByLabel("Password", { exact: true }).fill("sample-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "AI learning advisor", exact: true }),
  ).toBeVisible();
  expect(
    requests.find((item) => item.path === "/auth/login").body.identifier,
  ).toBe("alex");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => sessionStorage.getItem("token"))).toBeNull();
});

test("students are redirected away from instructor routes", async ({
  page,
}) => {
  await setupApi(page, { user: student });
  await page.goto("/instructor/courses/new");
  await expect(page).toHaveURL(/\/student\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex." }),
  ).toBeVisible();
  await expectNoOverflow(page);
});

test("expired sessions clear the token; temporary errors preserve it", async ({
  page,
}) => {
  let status = 503;
  await setupApi(page, {
    user: student,
    handler: async ({ path, reply }) => {
      if (path !== "/auth/me") return false;
      await reply(
        { message: status === 503 ? "Try later" : "Token expired" },
        status,
      );
      return true;
    },
  });
  await page.goto("/student/my-courses");
  await expect(page.getByRole("alert")).toContainText("Try later");
  expect(await page.evaluate(() => sessionStorage.getItem("token"))).toBe(
    "browser-test-token",
  );
  status = 401;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => sessionStorage.getItem("token"))).toBeNull();
});

test("course enrollment sends the course ID and current Bearer token", async ({
  page,
}) => {
  const requests = await setupApi(page, { user: student });
  await page.goto(`/courses/${course._id}`);
  await page
    .getByRole("button", { name: "Enroll in course", exact: true })
    .click();
  await expect(page.getByText("You're enrolled in this course.")).toBeVisible();
  const submission = requests.find((item) => item.path === "/enrollments");
  expect(submission.body).toEqual({ courseId: course._id });
  expect(submission.authorization).toBe("Bearer browser-test-token");
  await expectNoOverflow(page);
});

test("unknown enrollment status never offers an enrollment action", async ({
  page,
}) => {
  await setupApi(page, {
    user: student,
    handler: async ({ path, reply }) => {
      if (path !== "/enrollments/me") return false;
      await reply({ message: "Enrollment service unavailable" }, 503);
      return true;
    },
  });
  await page.goto(`/courses/${course._id}`);
  await expect(page.getByRole("alert")).toContainText(
    "Enrollment service unavailable",
  );
  await expect(
    page.getByRole("button", { name: "Enroll in course", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Retry enrollment check" }),
  ).toBeVisible();
});

test("enrollment history preserves archived and missing courses", async ({
  page,
}) => {
  await setupApi(page, {
    user: student,
    enrollments: [
      enrollment,
      {
        ...enrollment,
        _id: "archived",
        courseId: { ...course, title: "Archived course", isDeleted: true },
        status: "unenrolled",
      },
      { ...enrollment, _id: "missing", courseId: null, status: "unenrolled" },
    ],
  });
  await page.goto("/student/my-courses");
  await expect(
    page.getByRole("heading", { name: "Archived course" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Course unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue learning" }),
  ).toHaveCount(1);
  await page.locator("summary").first().click();
  await expect(page.getByText("student enrollment").first()).toBeVisible();
  await expectNoOverflow(page);
});

test("editing then creating a course resets the form and uses the correct API method", async ({
  page,
}) => {
  const requests = await setupApi(page, { user: instructor });
  await page.goto(`/instructor/courses/${course._id}/edit`);
  await expect(page.getByLabel("Course title")).toHaveValue(course.title);
  await page.getByLabel("Course title").fill("Updated React course");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/instructor\/courses$/);
  expect(requests.find((item) => item.method === "PATCH").body.title).toBe(
    "Updated React course",
  );
  await page.goto(`/instructor/courses/${course._id}/edit`);
  await expect(page.getByLabel("Course title")).toHaveValue(course.title);
  await page
    .getByRole("navigation", { name: "Workspace navigation" })
    .getByRole("link", { name: "Create course" })
    .click();
  await expect(page.getByLabel("Course title")).toHaveValue("");
  await page.getByRole("button", { name: "Publish course" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await page.getByLabel("Course title").fill("My new course");
  await page.getByLabel("Short description").fill(course.description);
  await page.getByLabel("Course content").fill(course.content);
  await page.getByLabel("Category", { exact: true }).fill(course.category);
  await expectNoOverflow(page);
  await page.getByRole("button", { name: "Publish course" }).click();
  await expect(page).toHaveURL(/\/instructor\/courses$/);
  expect(
    requests.find((item) => item.path === "/courses" && item.method === "POST")
      .body.title,
  ).toBe("My new course");
});

test("archive failures remain visible without removing the course", async ({
  page,
}) => {
  await setupApi(page, {
    user: instructor,
    handler: async ({ request, reply }) => {
      if (request.method() !== "DELETE") return false;
      await reply({ message: "Unable to archive course" }, 500);
      return true;
    },
  });
  await page.goto("/instructor/courses");
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Unable to archive course",
  );
  await expect(page.getByRole("heading", { name: course.title })).toBeVisible();
  await expect(page.getByText("Published", { exact: true })).toBeVisible();
});

test("instructor roster supports history filtering and student removal", async ({
  page,
}) => {
  const requests = await setupApi(page, { user: instructor });
  await page.goto(`/instructor/courses/${course._id}/students`);
  await expect(page.getByRole("cell", { name: student.email })).toBeVisible();
  await expectNoOverflow(page);
  await page.getByLabel("Show enrollments").selectOption("all");
  await page.getByText("History", { exact: true }).click();
  await expect(page.getByText("student enrollment")).toBeVisible();
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Unenroll", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Student unenrolled successfully",
  );
  expect(
    requests.some(
      (item) =>
        item.method === "PATCH" &&
        item.path.endsWith(`/${student.id}/unenroll`),
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Unenroll", exact: true }),
  ).toHaveCount(0);
});

test("AI validates goals, restores failed prompts, and displays recommendations", async ({
  page,
}, testInfo) => {
  let fail = true;
  const requests = await setupApi(page, {
    user: student,
    handler: async ({ path, reply }) => {
      if (path !== "/ai/recommendations" || !fail) return false;
      await reply({ message: "AI service temporarily unavailable." }, 503);
      return true;
    },
  });
  await page.goto("/student/ai-advisor");
  await page.getByLabel("Your learning goal").fill("short");
  await page.getByRole("button", { name: "Get suggestions" }).click();
  await expect(page.getByRole("alert")).toContainText("at least 10 characters");
  expect(requests.some((item) => item.path === "/ai/recommendations")).toBe(
    false,
  );
  await page
    .getByLabel("Your learning goal")
    .fill("I want to improve my React skills.");
  await page.getByRole("button", { name: "Get suggestions" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await expect(page.getByLabel("Your learning goal")).toHaveValue(
    "I want to improve my React skills.",
  );
  fail = false;
  await page.getByRole("button", { name: "Get suggestions" }).click();
  await expect(page.getByRole("heading", { name: course.title })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View course", exact: true }),
  ).toHaveAttribute("href", `/courses/${course._id}`);
  await expectNoOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath("advisor.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Clear chat" }).click();
  await expect(
    page.getByRole("heading", { name: "What do you want to learn?" }),
  ).toBeVisible();
});
