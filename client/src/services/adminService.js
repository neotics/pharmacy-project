import api from "./api";

export const fetchAdminOverview = async () => {
  const { data } = await api.get("/admin/overview");
  return data;
};

export const fetchAdminUsers = async (params = {}) => {
  const { data } = await api.get("/admin/users", { params });
  return data;
};

export const updateAdminUser = async (userId, payload) => {
  const { data } = await api.patch(`/admin/users/${userId}`, payload);
  return data;
};

export const resetAdminUserPassword = async (userId, payload) => {
  const { data } = await api.post(`/admin/users/${userId}/reset-password`, payload);
  return data;
};

export const fetchAdminPrescriptions = async (params = {}) => {
  const { data } = await api.get("/admin/prescriptions", { params });
  return data;
};

export const fetchAdminLogs = async (params = {}) => {
  const { data } = await api.get("/admin/logs", { params });
  return data;
};

export const syncAdminPatientLinks = async () => {
  const { data } = await api.post("/admin/patient-links/sync");
  return data;
};
