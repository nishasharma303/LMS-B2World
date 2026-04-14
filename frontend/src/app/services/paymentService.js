const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export async function createPlanOrder(payload) {
  const res = await fetch(`${API_BASE_URL}/payments/plan/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function verifyPlanAndSignup(payload) {
  const res = await fetch(`${API_BASE_URL}/payments/plan/verify-and-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function createCourseOrder(payload, token) {
  const res = await fetch(`${API_BASE_URL}/payments/course/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function verifyCoursePayment(payload, token) {
  const res = await fetch(`${API_BASE_URL}/payments/course/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}