const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function parseResponse(res, fallbackMessage) {
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || fallbackMessage);
    error.data = data;
    error.status = res.status;
    throw error;
  }

  return data;
}

export async function getCourses(token) {
  const res = await fetch(`${API_BASE}/courses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return parseResponse(res, "Failed to fetch courses");
}

export async function getMyCourses(token) {
  const res = await fetch(`${API_BASE}/courses/my-courses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return parseResponse(res, "Failed to fetch enrolled courses");
}

export async function getCourseById(token, courseId) {
  const res = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return parseResponse(res, "Failed to fetch course");
}

export async function enrollInCourse(token, courseId) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(res, "Failed to enroll in course");
}

export async function markLessonComplete(token, lessonId) {
  const res = await fetch(`${API_BASE}/courses/lessons/${lessonId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(res, "Failed to mark lesson complete");
}

export async function createCourse(token, payload) {
  const res = await fetch(`${API_BASE}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(res, "Failed to create course");
}

export async function updateCourse(token, courseId, payload) {
  const res = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(res, "Failed to update course");
}

export async function deleteCourse(token, courseId) {
  const res = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(res, "Failed to delete course");
}
