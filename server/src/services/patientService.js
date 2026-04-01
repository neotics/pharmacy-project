import Patient from "../models/Patient.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { validatePatientPayload } from "../utils/validators.js";

export const upsertDoctorPatient = async ({ doctorId, patient }) => {
  const normalizedPatient = validatePatientPayload(patient);
  const linkedUser = normalizedPatient.email
    ? await User.findOne({
        email: normalizedPatient.email,
        role: "patient",
      })
    : null;

  if (normalizedPatient.email) {
    const existingPatient = await Patient.findOne({
      doctorId,
      email: normalizedPatient.email,
    });

    if (existingPatient) {
      existingPatient.name = normalizedPatient.name;
      existingPatient.age = normalizedPatient.age;
      existingPatient.userId = linkedUser?._id ?? existingPatient.userId;
      await existingPatient.save();
      return existingPatient;
    }
  }

  return Patient.create({
    ...normalizedPatient,
    doctorId,
    userId: linkedUser?._id ?? null,
  });
};

export const resolveDoctorPatient = async ({ doctorId, patientId, patient }) => {
  if (patientId) {
    const existingPatient = await Patient.findOne({
      _id: patientId,
      doctorId,
    });

    if (!existingPatient) {
      throw new ApiError(404, "Patient not found for this doctor.");
    }

    return existingPatient;
  }

  if (!patient) {
    throw new ApiError(400, "Patient details are required.");
  }

  return upsertDoctorPatient({ doctorId, patient });
};

