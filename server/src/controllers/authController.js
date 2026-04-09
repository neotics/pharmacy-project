import Patient from "../models/Patient.js";
import User from "../models/User.js";
import { createAuditLog } from "../services/auditLogService.js";
import {
  ensureUserCanAccessApp,
  sanitizeUser,
  signAccessToken,
} from "../services/authService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {
  validateLoginPayload,
  validateRegisterPayload,
} from "../utils/validators.js";

export const register = asyncHandler(async (req, res) => {
  const payload = validateRegisterPayload(req.body);
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  const user = await User.create(payload);

  if (user.role === "patient") {
    await Patient.updateMany(
      {
        email: user.email,
        $or: [{ userId: null }, { userId: { $exists: false } }],
      },
      {
        $set: { userId: user._id },
      }
    );
  }

  await createAuditLog({
    actor: user,
    action: "auth.register",
    entityType: "user",
    entityId: user._id,
    message: `User registered with role ${user.role}.`,
    metadata: {
      email: user.email,
      requiresApproval: ["doctor", "pharmacy"].includes(user.role),
    },
  });

  const token = signAccessToken(user);

  res.status(201).json({
    message:
      user.role === "doctor" || user.role === "pharmacy"
        ? "User registered successfully. Waiting for admin approval."
        : "User registered successfully.",
    user: sanitizeUser(user),
    token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const payload = validateLoginPayload(req.body);
  const user = await User.findOne({ email: payload.email });

  if (!user || !(await user.comparePassword(payload.password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  ensureUserCanAccessApp(user);

  const token = signAccessToken(user);

  await createAuditLog({
    actor: user,
    action: "auth.login",
    entityType: "user",
    entityId: user._id,
    message: `User logged in as ${user.role}.`,
  });

  res.json({
    message: "Login successful.",
    user: sanitizeUser(user),
    token,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  ensureUserCanAccessApp(req.user);

  res.json({
    user: sanitizeUser(req.user),
  });
});
