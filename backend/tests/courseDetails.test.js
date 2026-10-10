import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:8080/api/courses";

// Test 1: Existing course
test("GET /api/courses/:id returns course details", async () => {
  const listResponse = await fetch(BASE_URL);
  assert.equal(listResponse.status, 200);

  const listData = await listResponse.json();

  assert.ok(
    listData.courses.length > 0,
    "At least one course is required for this test"
  );

  const courseId = listData.courses[0]._id;

  const response = await fetch(`${BASE_URL}/${courseId}`);

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.success, true);
  assert.equal(data.course._id, courseId);

  assert.ok(data.course.title);
  assert.ok(data.course.description);
  assert.ok(data.course.content);
  assert.ok(data.course.category);
  assert.ok(data.course.level);
  assert.ok(data.course.instructorId);
});

// Test 2: Invalid ObjectId
test("GET /api/courses/:id rejects invalid ID", async () => {
  const response = await fetch(`${BASE_URL}/abc123`);

  assert.equal(response.status, 400);

  const data = await response.json();

  assert.equal(data.success, false);
  assert.equal(data.message, "Invalid course ID");
});

// Test 3: Invalid hexadecimal ObjectId
test("GET /api/courses/:id rejects non-hex ID", async () => {
  const response = await fetch(
    `${BASE_URL}/zzzzzzzzzzzzzzzzzzzzzzzz`
  );

  assert.equal(response.status, 400);
});

// Test 4: Nonexistent course
test("GET /api/courses/:id returns 404", async () => {
  const response = await fetch(
    `${BASE_URL}/ffffffffffffffffffffffff`
  );

  assert.equal(response.status, 404);

  const data = await response.json();

  assert.equal(data.success, false);
  assert.equal(data.message, "Course not found");
});

// Test 5: Public access
test("GET /api/courses/:id works without JWT", async () => {
  const listResponse = await fetch(BASE_URL);
  const listData = await listResponse.json();

  assert.ok(listData.courses.length > 0);

  const courseId = listData.courses[0]._id;

  const response = await fetch(
    `${BASE_URL}/${courseId}`
  );

  assert.equal(response.status, 200);
});

// Test 6: Existing list API still works
test("GET /api/courses remains working", async () => {
  const response = await fetch(BASE_URL);

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.courses));
  assert.equal(data.count, data.courses.length);

  for (const course of data.courses) {
    assert.equal(
      Object.hasOwn(course, "content"),
      false
    );
  }
});