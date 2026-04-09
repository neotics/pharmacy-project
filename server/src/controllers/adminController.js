import asyncHandler from "../utils/asyncHandler.js";
import {
  getAdminOverview,
  listAdminPrescriptions,
  listAdminUsers,
  listAuditLogs,
  resetManagedUserPassword,
  syncPatientLinks,
  updateManagedUser,
} from "../services/adminService.js";
import { sanitizeUser } from "../services/authService.js";
import {
  validateAdminUserUpdatePayload,
  validatePasswordResetPayload,
} from "../utils/validators.js";

export const getOverview = asyncHandler(async (_req, res) => {
  const overview = await getAdminOverview();
  res.json(overview);
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await listAdminUsers(req.query);

  res.json({
    users: users.map((user) => sanitizeUser(user)),
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const payload = validateAdminUserUpdatePayload(req.body);
  const user = await updateManagedUser({
    actor: req.user,
    userId: req.params.id,
    payload,
  });

  res.json({
    message: "User updated successfully.",
    user: sanitizeUser(user),
  });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const payload = validatePasswordResetPayload(req.body);
  const user = await resetManagedUserPassword({
    actor: req.user,
    userId: req.params.id,
    nextPassword: payload.password,
  });

  res.json({
    message: "Password reset successfully.",
    user: sanitizeUser(user),
  });
});

export const getPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await listAdminPrescriptions(req.query);
  res.json({ prescriptions });
});

export const getLogs = asyncHandler(async (req, res) => {
  const logs = await listAuditLogs(req.query);
  res.json({ logs });
});

export const syncPatients = asyncHandler(async (req, res) => {
  const linkedCount = await syncPatientLinks(req.user);

  res.json({
    message: `Patient links synced successfully. ${linkedCount} record(s) updated.`,
    linkedCount,
  });
});
