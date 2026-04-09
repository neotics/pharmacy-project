import express from "express";

import {
  getLogs,
  getOverview,
  getPrescriptions,
  getUsers,
  resetUserPassword,
  syncPatients,
  updateUser,
} from "../controllers/adminController.js";
import { authorizeRoles, requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(requireAuth, authorizeRoles("admin"));
router.get("/overview", getOverview);
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.post("/users/:id/reset-password", resetUserPassword);
router.get("/prescriptions", getPrescriptions);
router.get("/logs", getLogs);
router.post("/patient-links/sync", syncPatients);

export default router;
