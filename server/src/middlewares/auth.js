import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ensureUserCanAccessApp } from "../services/authService.js";

const readBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
};

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = readBearerToken(req.headers.authorization);

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, "Access token is invalid or expired.");
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    throw new ApiError(401, "User for this token was not found.");
  }

  ensureUserCanAccessApp(user);
  req.user = user;
  next();
});

export const authorizeRoles =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have access to this resource."));
      return;
    }

    next();
  };
