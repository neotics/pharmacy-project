import Patient from "../models/Patient.js";
import { createAuditLog } from "../services/auditLogService.js";
import { upsertDoctorPatient } from "../services/patientService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await upsertDoctorPatient({
    doctorId: req.user._id,
    patient: req.body,
  });

  await createAuditLog({
    actor: req.user,
    action: "patient.saved",
    entityType: "patient",
    entityId: patient._id,
    message: `Doctor saved patient profile for ${patient.name}.`,
    metadata: {
      patientEmail: patient.email ?? null,
    },
  });

  res.status(201).json({
    message: "Patient saved successfully.",
    patient,
  });
});

export const listPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({
    doctorId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({
    patients,
  });
});
