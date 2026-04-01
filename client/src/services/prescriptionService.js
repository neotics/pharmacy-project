import api from "./api";

export const fetchPrescriptions = async (params = {}) => {
  const { data } = await api.get("/prescriptions", { params });
  return data;
};

export const fetchPrescriptionById = async (prescriptionId) => {
  const { data } = await api.get(`/prescriptions/${prescriptionId}`);
  return data;
};

export const createPrescription = async (payload) => {
  const { data } = await api.post("/prescriptions", payload);
  return data;
};

export const verifyPrescription = async (payload) => {
  const { data } = await api.post("/prescriptions/verify", payload);
  return data;
};

export const usePrescription = async (payload) => {
  const { data } = await api.post("/prescriptions/use", payload);
  return data;
};

