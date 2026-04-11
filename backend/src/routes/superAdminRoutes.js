import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddlewares.js";

import {
  createInstitute,
  getAllInstitutes,
  getInstitute,
  updateInstitute,
  getAnalytics,
} from "../controllers/superAdminController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("SUPER_ADMIN"));

router.post("/institutes", createInstitute);
router.get("/institutes", getAllInstitutes);
router.get("/institutes/:id", getInstitute);
router.put("/institutes/:id", updateInstitute);

router.get("/analytics", getAnalytics);

export default router;