import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  port: toNumber(process.env.PORT, 5000),
  mongoUri:
    process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/e_prescription_system",
  jwtSecret: process.env.JWT_SECRET ?? "development_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  prescriptionTokenExpiresIn:
    process.env.PRESCRIPTION_TOKEN_EXPIRES_IN ?? "30d",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
};

