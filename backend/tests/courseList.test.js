import test from "node:test";
import assert from "node:assert/strict";

test("GET /api/courses returns public courses", async () => {
  const response = await fetch(
    "http://localhost:8080/api/courses"
  );

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.courses));
  assert.equal(data.count, data.courses.length);

  for (const course of data.courses) {
    assert.ok(course._id);
    assert.ok(course.title);
    assert.ok(course.instructorId);

    assert.equal(
      Object.hasOwn(course, "content"),
      false
    );
  }
});