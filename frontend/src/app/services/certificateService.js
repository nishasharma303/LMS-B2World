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

export async function getMyCertificates(token) {
  const res = await fetch(`${API_BASE}/certificates/my`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return parseResponse(res, "Failed to fetch certificates");
}

export async function getCertificateEligibility(token, courseId) {
  const res = await fetch(`${API_BASE}/certificates/course/${courseId}/eligibility`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return parseResponse(res, "Failed to fetch certificate eligibility");
}

export async function generateCertificate(token, courseId) {
  const res = await fetch(`${API_BASE}/certificates/course/${courseId}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(res, "Failed to generate certificate");
}

export async function getCertificateById(token, certificateId) {
  const res = await fetch(`${API_BASE}/certificates/${certificateId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return parseResponse(res, "Failed to fetch certificate");
}