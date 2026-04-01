import ApiError from "./ApiError.js";

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeEmail = (value) => normalizeString(value).toLowerCase();

export const validateRegisterPayload = (payload = {}) => {
  const name = normalizeString(payload.name);
  const email = normalizeEmail(payload.email);
  const password = normalizeString(payload.password);
  const role = normalizeString(payload.role);

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "Name, email, password, and role are required.");
  }

  if (!["doctor", "pharmacy", "patient"].includes(role)) {
    throw new ApiError(400, "Invalid role supplied.");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long.");
  }

  return { name, email, password, role };
};

export const validateLoginPayload = (payload = {}) => {
  const email = normalizeEmail(payload.email);
  const password = normalizeString(payload.password);

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  return { email, password };
};

export const validatePatientPayload = (payload = {}) => {
  const name = normalizeString(payload.name);
  const age = Number(payload.age);
  const email = payload.email ? normalizeEmail(payload.email) : "";

  if (!name || Number.isNaN(age) || age <= 0) {
    throw new ApiError(400, "Patient name and a valid age are required.");
  }

  return { name, age, email: email || undefined };
};

export const validatePrescriptionPayload = (payload = {}) => {
  const patientId = normalizeString(payload.patientId);
  const patient = payload.patient ?? null;
  const medications = Array.isArray(payload.medications)
    ? payload.medications
    : [];

  if (!patientId && !patient) {
    throw new ApiError(
      400,
      "Either an existing patientId or patient details are required."
    );
  }

  if (medications.length === 0) {
    throw new ApiError(400, "At least one medication is required.");
  }

  const normalizedMedications = medications.map((item, index) => {
    const name = normalizeString(item.name);
    const dosage = normalizeString(item.dosage);
    const instructions = normalizeString(item.instructions);

    if (!name || !dosage || !instructions) {
      throw new ApiError(
        400,
        `Medication #${index + 1} requires name, dosage, and instructions.`
      );
    }

    return { name, dosage, instructions };
  });

  return {
    patientId: patientId || undefined,
    patient: patient ? validatePatientPayload(patient) : undefined,
    medications: normalizedMedications,
  };
};

export const validatePrescriptionTokenPayload = (payload = {}) => {
  const token = normalizeString(payload.token);

  if (!token) {
    throw new ApiError(400, "Prescription token is required.");
  }

  return { token };
};

