import api from "./api";

export const fetchPatients = async () => {
  const { data } = await api.get("/patients");
  return data;
};

export const createPatient = async (payload) => {
  const { data } = await api.post("/patients", payload);
  return data;
};

