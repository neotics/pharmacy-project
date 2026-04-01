import jwt from "jsonwebtoken";
import QRCode from "qrcode";

import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

export const signPrescriptionToken = (prescriptionId) =>
  jwt.sign(
    {
      type: "prescription",
      prescriptionId: prescriptionId.toString(),
    },
    env.jwtSecret,
    {
      expiresIn: env.prescriptionTokenExpiresIn,
    }
  );

export const verifyPrescriptionToken = (token) => {
  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (payload.type !== "prescription" || !payload.prescriptionId) {
      throw new ApiError(400, "Invalid prescription token.");
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, "Prescription token is invalid or expired.");
  }
};

export const generatePrescriptionQrCode = async (token) =>
  QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 2,
    color: {
      dark: "#144f45",
      light: "#f6f1e7",
    },
    width: 360,
  });

