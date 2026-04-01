import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

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
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};

