import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddlewares.js";
import {
  getInstituteUsersByRole,
  createInstituteUser,
  updateInstituteUser,
  toggleInstituteUserStatus,
  deleteInstituteUser,
} from "../controllers/userManagementController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("INSTITUTE_ADMIN"));

router.get("/", getInstituteUsersByRole);
router.post("/", createInstituteUser);
router.put("/:id", updateInstituteUser);
router.patch("/:id/status", toggleInstituteUserStatus);
router.delete("/:id", deleteInstituteUser);

export default router;