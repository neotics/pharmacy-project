import Medication from "../models/Medication.js";
import Patient from "../models/Patient.js";

export const prescriptionPopulate = [
  {
    path: "patientId",
    select: "name age email doctorId userId createdAt",
  },
  {
    path: "doctorId",
    select: "name email role",
  },
  {
    path: "usedBy",
    select: "name email role",
  },
];

export const attachMedications = async (records) => {
  if (!records) {
    return null;
  }

  const items = Array.isArray(records) ? records : [records];
  const prescriptionIds = items.map((item) => item._id);

  const medications = await Medication.find({
    prescriptionId: { $in: prescriptionIds },
  }).sort({ createdAt: 1 });

  const medicationsByPrescription = medications.reduce((accumulator, item) => {
    const key = item.prescriptionId.toString();

    if (!accumulator.has(key)) {
      accumulator.set(key, []);
    }

    accumulator.get(key).push(item);
    return accumulator;
  }, new Map());

  const enriched = items.map((item) => {
    const plainItem = item.toObject ? item.toObject() : item;

    return {
      ...plainItem,
      medications: medicationsByPrescription.get(item._id.toString()) ?? [],
    };
  });

  return Array.isArray(records) ? enriched : enriched[0];
};

export const getPatientScopedIds = async (user) => {
  const patients = await Patient.find({
    $or: [{ userId: user._id }, { email: user.email }],
  }).select("_id");

  return patients.map((patient) => patient._id);
};

