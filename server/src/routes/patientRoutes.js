import express from "express";

import {
  createPatient,
  listPatients,
} from "../controllers/patientController.js";
import { authorizeRoles, requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(requireAuth, authorizeRoles("doctor"));
router.get("/", listPatients);
router.post("/", createPatient);

export default router;

