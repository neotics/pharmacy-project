import jwt from "jsonwebtoken";
import User from "../models/User.js";

import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import { createAuditLog } from "./auditLogService.js";

export const defaultAdminCredentials = {
  name: "System Admin",
  email: "seva",
  password: "admin",
  role: "admin",
};

export const signAccessToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );

export const sanitizeUser = (user) => {
  const source = user?.toJSON ? user.toJSON() : user;

  return {
    _id: source._id,
    name: source.name,
    email: source.email,
    role: source.role,
    status: source.status,
    isApproved: source.isApproved,
    approvedAt: source.approvedAt ?? null,
    approvedBy: source.approvedBy ?? null,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};

export const ensureUserCanAccessApp = (user) => {
  if (user.status === "blocked") {
    throw new ApiError(403, "This account is blocked. Contact the administrator.");
  }

  if (["doctor", "pharmacy"].includes(user.role) && !user.isApproved) {
    throw new ApiError(
      403,
      "This account is waiting for admin approval before it can access the system."
    );
  }
};

export const ensureDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({ email: defaultAdminCredentials.email });

  if (existingAdmin) {
    let changed = false;

    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      changed = true;
    }

    if (existingAdmin.status !== "active") {
      existingAdmin.status = "active";
      changed = true;
    }

    if (!existingAdmin.isApproved) {
      existingAdmin.isApproved = true;
      existingAdmin.approvedAt = new Date();
      changed = true;
    }

    existingAdmin.password = defaultAdminCredentials.password;
    changed = true;

    if (changed) {
      await existingAdmin.save();
      await createAuditLog({
        action: "system.admin.bootstrap",
        entityType: "user",
        entityId: existingAdmin._id,
        message: "Default admin account was synchronized.",
        metadata: {
          email: existingAdmin.email,
        },
      });
    }

    return existingAdmin;
  }

  const admin = await User.create({
    ...defaultAdminCredentials,
    status: "active",
    isApproved: true,
    approvedAt: new Date(),
  });

  await createAuditLog({
    action: "system.admin.bootstrap",
    entityType: "user",
    entityId: admin._id,
    message: "Default admin account was created.",
    metadata: {
      email: admin.email,
    },
  });

  return admin;
};
