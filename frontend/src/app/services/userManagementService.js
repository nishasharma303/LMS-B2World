const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function handleResponse(res) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function getInstituteUsers(token, role) {
  const res = await fetch(`${API_BASE}/institute-users?role=${role}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return handleResponse(res);
}

export async function createInstituteUser(token, payload) {
  const res = await fetch(`${API_BASE}/institute-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

export async function updateInstituteUser(token, userId, payload) {
  const res = await fetch(`${API_BASE}/institute-users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

export async function toggleInstituteUserStatus(token, userId) {
  const res = await fetch(`${API_BASE}/institute-users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(res);
}

export async function deleteInstituteUser(token, userId) {
  const res = await fetch(`${API_BASE}/institute-users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(res);
}