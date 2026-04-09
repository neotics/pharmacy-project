import AuditLog from "../models/AuditLog.js";
import Patient from "../models/Patient.js";
import Prescription from "../models/Prescription.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { createAuditLog } from "./auditLogService.js";
import { attachMedications, prescriptionPopulate } from "./prescriptionService.js";

const buildRegex = (value) =>
  new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

export const getAdminOverview = async () => {
  const [
    totalUsers,
    totalPatients,
    totalPrescriptions,
    activePrescriptions,
    usedPrescriptions,
    pendingApprovals,
    blockedUsers,
    totalDoctors,
    totalPharmacies,
    recentUsers,
    recentPrescriptionsRaw,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments(),
    Patient.countDocuments(),
    Prescription.countDocuments(),
    Prescription.countDocuments({ status: "active" }),
    Prescription.countDocuments({ status: "used" }),
    User.countDocuments({
      role: { $in: ["doctor", "pharmacy"] },
      isApproved: false,
    }),
    User.countDocuments({ status: "blocked" }),
    User.countDocuments({ role: "doctor" }),
    User.countDocuments({ role: "pharmacy" }),
    User.find().sort({ createdAt: -1 }).limit(6).populate("approvedBy", "name email role"),
    Prescription.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate(prescriptionPopulate),
    AuditLog.find().sort({ createdAt: -1 }).limit(8).populate("actorId", "name email role"),
  ]);

  const recentPrescriptions = await attachMedications(recentPrescriptionsRaw);

  return {
    stats: {
      totalUsers,
      totalPatients,
      totalPrescriptions,
      activePrescriptions,
      usedPrescriptions,
      pendingApprovals,
      blockedUsers,
      totalDoctors,
      totalPharmacies,
    },
    recentUsers,
    recentPrescriptions,
    recentLogs,
  };
};

export const listAdminUsers = async ({ search = "", role = "", status = "", approved = "" }) => {
  const query = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  if (approved === "true") {
    query.isApproved = true;
  }

  if (approved === "false") {
    query.isApproved = false;
  }

  if (search.trim()) {
    const pattern = buildRegex(search.trim());
    query.$or = [{ name: pattern }, { email: pattern }];
  }

  return User.find(query)
    .sort({ createdAt: -1 })
    .populate("approvedBy", "name email role");
};

export const updateManagedUser = async ({ actor, userId, payload }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user._id.toString() === actor._id.toString()) {
    throw new ApiError(400, "Admin cannot modify their own access from this panel.");
  }

  const changes = [];

  if (payload.status && payload.status !== user.status) {
    user.status = payload.status;
    changes.push(`status: ${payload.status}`);
  }

  if (typeof payload.isApproved === "boolean" && payload.isApproved !== user.isApproved) {
    user.isApproved = payload.isApproved;
    user.approvedAt = payload.isApproved ? new Date() : null;
    user.approvedBy = payload.isApproved ? actor._id : null;
    changes.push(payload.isApproved ? "approved" : "approval revoked");
  }

  if (payload.role && payload.role !== user.role) {
    if (payload.role === "admin") {
      throw new ApiError(400, "Promoting users to admin is not supported here.");
    }

    user.role = payload.role;

    if (payload.role === "patient") {
      user.isApproved = true;
      user.approvedAt = new Date();
      user.approvedBy = actor._id;
    }

    if (["doctor", "pharmacy"].includes(payload.role) && !user.isApproved) {
      user.approvedAt = null;
      user.approvedBy = null;
    }

    changes.push(`role: ${payload.role}`);
  }

  if (changes.length === 0) {
    return user.populate("approvedBy", "name email role");
  }

  await user.save();
  await createAuditLog({
    actor,
    action: "admin.user.updated",
    entityType: "user",
    entityId: user._id,
    message: `Admin updated ${user.email}: ${changes.join(", ")}.`,
    metadata: {
      changes,
      targetUserId: user._id.toString(),
    },
  });

  return user.populate("approvedBy", "name email role");
};

export const resetManagedUserPassword = async ({ actor, userId, nextPassword }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.password = nextPassword;
  await user.save();

  await createAuditLog({
    actor,
    action: "admin.user.password_reset",
    entityType: "user",
    entityId: user._id,
    message: `Admin reset password for ${user.email}.`,
    metadata: {
      targetUserId: user._id.toString(),
    },
  });

  return user.populate("approvedBy", "name email role");
};

export const listAdminPrescriptions = async ({ search = "", status = "" }) => {
  const query = {};

  if (status) {
    query.status = status;
  }

  const prescriptions = await Prescription.find(query)
    .sort({ createdAt: -1 })
    .populate(prescriptionPopulate);

  const enrichedPrescriptions = await attachMedications(prescriptions);

  if (!search.trim()) {
    return enrichedPrescriptions;
  }

  const normalized = search.trim().toLowerCase();

  return enrichedPrescriptions.filter((prescription) => {
    const patientName = prescription.patientId?.name?.toLowerCase() ?? "";
    const patientEmail = prescription.patientId?.email?.toLowerCase() ?? "";
    const doctorName = prescription.doctorId?.name?.toLowerCase() ?? "";

    return (
      prescription._id.toString().toLowerCase().includes(normalized) ||
      patientName.includes(normalized) ||
      patientEmail.includes(normalized) ||
      doctorName.includes(normalized)
    );
  });
};

export const listAuditLogs = async ({ limit = 50 }) =>
  AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 50, 1), 200))
    .populate("actorId", "name email role");

export const syncPatientLinks = async (actor) => {
  const patientUsers = await User.find({ role: "patient" }).select("_id email");
  const userIdByEmail = patientUsers.reduce((accumulator, user) => {
    accumulator.set(user.email, user._id);
    return accumulator;
  }, new Map());

  const patients = await Patient.find({
    email: { $exists: true, $ne: null },
  });

  let linkedCount = 0;

  for (const patient of patients) {
    const nextUserId = userIdByEmail.get(patient.email);

    if (!nextUserId) {
      continue;
    }

    if (patient.userId?.toString() === nextUserId.toString()) {
      continue;
    }

    patient.userId = nextUserId;
    await patient.save();
    linkedCount += 1;
  }

  await createAuditLog({
    actor,
    action: "admin.patient_links.synced",
    entityType: "patient",
    message: `Admin synced patient account links. ${linkedCount} record(s) updated.`,
    metadata: {
      linkedCount,
    },
  });

  return linkedCount;
};
