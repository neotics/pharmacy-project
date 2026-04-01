import express from "express";

import {
  createPrescription,
  getPrescriptionById,
  listPrescriptions,
  usePrescription,
  verifyPrescription,
} from "../controllers/prescriptionController.js";
import { authorizeRoles, requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", requireAuth, listPrescriptions);
router.post("/", requireAuth, authorizeRoles("doctor"), createPrescription);
router.post(
  "/verify",
  requireAuth,
  authorizeRoles("pharmacy"),
  verifyPrescription
);
router.post("/use", requireAuth, authorizeRoles("pharmacy"), usePrescription);
router.get("/:id", requireAuth, getPrescriptionById);

export default router;

