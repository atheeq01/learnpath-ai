import { test, expect } from "@playwright/test";

test("live Express catalog and details render through the Vite proxy", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/courses");
  await expect(page.locator("#course-catalog article").first()).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("live-catalog.png"),
    fullPage: true,
  });
  await page
    .locator("#course-catalog article")
    .first()
    .getByRole("link")
    .click();
  await expect(
    page.getByRole("heading", { name: "What you'll learn" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Log in to enroll" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("live Express endpoints enforce authentication and reject invalid course IDs", async ({
  request,
}) => {
  for (const [method, path] of [
    ["get", "/auth/me"],
    ["get", "/enrollments/me"],
    ["post", "/enrollments"],
    ["get", "/instructor/courses"],
    ["get", "/instructor/courses/111111111111111111111111/students"],
    [
      "patch",
      "/instructor/courses/111111111111111111111111/students/222222222222222222222222/unenroll",
    ],
    ["post", "/courses"],
    ["patch", "/courses/111111111111111111111111"],
    ["delete", "/courses/111111111111111111111111"],
    ["post", "/ai/recommendations"],
  ]) {
    const response = await request[method]("/api" + path);
    expect(response.status(), method + " " + path).toBe(401);
  }
  const invalid = await request.get("/api/courses/invalid");
  expect(invalid.status()).toBe(400);
  const response = await request.post("/api/auth/register", { data: {} });
  expect(response.status()).toBe(400);
});
