import api from "../lib/api";

export const createInstitute = (data) =>
  api.post("/super-admin/institutes", data);

export const getInstitutes = () =>
  api.get("/super-admin/institutes");

export const getInstitute = (id) =>
  api.get(`/super-admin/institutes/${id}`);

export const updateInstitute = (id, data) =>
  api.put(`/super-admin/institutes/${id}`, data);

export const getAnalytics = () =>
  api.get("/super-admin/analytics");