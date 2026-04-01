import Medication from "../models/Medication.js";
import Prescription from "../models/Prescription.js";
import { resolveDoctorPatient } from "../services/patientService.js";
import {
  attachMedications,
  getPatientScopedIds,
  prescriptionPopulate,
} from "../services/prescriptionService.js";
import {
  generatePrescriptionQrCode,
  signPrescriptionToken,
  verifyPrescriptionToken,
} from "../services/qrService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  validatePrescriptionPayload,
  validatePrescriptionTokenPayload,
} from "../utils/validators.js";

const getPopulatedPrescription = async (prescriptionId) => {
  const prescription = await Prescription.findById(prescriptionId).populate(
    prescriptionPopulate
  );

  if (!prescription) {
    throw new ApiError(404, "Prescription not found.");
  }

  return attachMedications(prescription);
};

const assertCanAccessPrescription = async (user, prescription) => {
  if (user.role === "pharmacy") {
    return;
  }

  if (user.role === "doctor") {
    if (prescription.doctorId._id.toString() !== user._id.toString()) {
      throw new ApiError(403, "You cannot access this prescription.");
    }

    return;
  }

  const patientIds = await getPatientScopedIds(user);
  const belongsToPatient = patientIds.some(
    (patientId) => patientId.toString() === prescription.patientId._id.toString()
  );

  if (!belongsToPatient) {
    throw new ApiError(403, "You cannot access this prescription.");
  }
};

export const createPrescription = asyncHandler(async (req, res) => {
  const payload = validatePrescriptionPayload(req.body);
  const patient = await resolveDoctorPatient({
    doctorId: req.user._id,
    patientId: payload.patientId,
    patient: payload.patient,
  });

  const prescription = await Prescription.create({
    patientId: patient._id,
    doctorId: req.user._id,
    status: "active",
    qrCode: "pending",
    token: "pending",
  });

  const token = signPrescriptionToken(prescription._id);
  const qrCode = await generatePrescriptionQrCode(token);

  prescription.token = token;
  prescription.qrCode = qrCode;
  await prescription.save();

  await Medication.insertMany(
    payload.medications.map((medication) => ({
      ...medication,
      prescriptionId: prescription._id,
    }))
  );

  const fullPrescription = await getPopulatedPrescription(prescription._id);

  res.status(201).json({
    message: "Prescription created successfully.",
    prescription: fullPrescription,
  });
});

export const listPrescriptions = asyncHandler(async (req, res) => {
  const query = {};

  if (req.user.role === "doctor") {
    query.doctorId = req.user._id;
  }

  if (req.user.role === "patient") {
    const patientIds = await getPatientScopedIds(req.user);
    query.patientId = { $in: patientIds };
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  const prescriptions = await Prescription.find(query)
    .sort({ createdAt: -1 })
    .populate(prescriptionPopulate);

  const enrichedPrescriptions = await attachMedications(prescriptions);

  res.json({
    prescriptions: enrichedPrescriptions,
  });
});

export const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await getPopulatedPrescription(req.params.id);
  await assertCanAccessPrescription(req.user, prescription);

  res.json({
    prescription,
  });
});

export const verifyPrescription = asyncHandler(async (req, res) => {
  const { token } = validatePrescriptionTokenPayload(req.body);
  const payload = verifyPrescriptionToken(token);
  const prescription = await Prescription.findById(payload.prescriptionId).populate(
    prescriptionPopulate
  );

  if (!prescription || prescription.token !== token) {
    throw new ApiError(404, "Prescription could not be verified.");
  }

  const enrichedPrescription = await attachMedications(prescription);

  if (enrichedPrescription.status === "used") {
    throw new ApiError(409, "This prescription has already been used.");
  }

  res.json({
    message: "Prescription verified successfully.",
    prescription: enrichedPrescription,
  });
});

export const usePrescription = asyncHandler(async (req, res) => {
  const { token } = validatePrescriptionTokenPayload(req.body);
  const payload = verifyPrescriptionToken(token);
  const prescription = await Prescription.findById(payload.prescriptionId);

  if (!prescription || prescription.token !== token) {
    throw new ApiError(404, "Prescription could not be found.");
  }

  if (prescription.status === "used") {
    throw new ApiError(409, "This prescription has already been used.");
  }

  prescription.status = "used";
  prescription.usedAt = new Date();
  prescription.usedBy = req.user._id;
  await prescription.save();

  const enrichedPrescription = await getPopulatedPrescription(prescription._id);

  res.json({
    message: "Prescription marked as used.",
    prescription: enrichedPrescription,
  });
});

