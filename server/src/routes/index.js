import express from "express";

import authRoutes from "./authRoutes.js";
import patientRoutes from "./patientRoutes.js";
import prescriptionRoutes from "./prescriptionRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/patients", patientRoutes);
router.use("/prescriptions", prescriptionRoutes);

export default router;

