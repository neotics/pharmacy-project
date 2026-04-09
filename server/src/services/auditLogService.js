import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async ({
  actor = null,
  action,
  entityType,
  entityId = null,
  message,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      actorId: actor?._id ?? null,
      actorRole: actor?.role ?? "system",
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      message,
      metadata,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};
