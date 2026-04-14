import { API_BASE_URL, getAuthHeaders } from "./authService";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function createInstitute(payload, token) {
  const response = await fetch(`${API_BASE_URL}/institutes`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getAllInstitutes(token) {
  const response = await fetch(`${API_BASE_URL}/institutes`, {
    method: "GET",
    headers: getAuthHeaders(token, false),
  });

  return handleResponse(response);
}

export async function getInstituteById(id, token) {
  const response = await fetch(`${API_BASE_URL}/institutes/${id}`, {
    method: "GET",
    headers: getAuthHeaders(token, false),
  });

  return handleResponse(response);
}

export async function updateInstitute(id, payload, token) {
  const response = await fetch(`${API_BASE_URL}/institutes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateInstituteStatus(id, payload, token) {
  const response = await fetch(`${API_BASE_URL}/institutes/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateInstitutePlan(id, payload, token) {
  const response = await fetch(`${API_BASE_URL}/institutes/${id}/plan`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function assignInstituteAdmin(id, payload, token) {
  const response = await fetch(`${API_BASE_URL}/institutes/${id}/admin`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getInstituteUsers(id, token) {
  const response = await fetch(`${API_BASE_URL}/institutes/${id}/users`, {
    method: "GET",
    headers: getAuthHeaders(token, false),
  });

  return handleResponse(response);
}

export async function getMyInstitute(token) {
  const response = await fetch(`${API_BASE_URL}/institutes/me/details`, {
    method: "GET",
    headers: getAuthHeaders(token, false),
  });

  return handleResponse(response);
}