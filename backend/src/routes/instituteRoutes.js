import express from "express";
import {
  assignInstituteAdmin,
  createInstitute,
  getAllInstitutes,
  getInstituteById,
  getInstituteUsers,
  getMyInstitute,
  updateInstitute,
  updateInstitutePlan,
  updateInstituteStatus,
  getInstituteCertificates,
  getInstituteReportsOverview,
} from "../controllers/instituteController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddlewares.js";
import { requireSameInstituteOrSuperAdmin } from "../middlewares/tenantMiddleware.js";
import { createInstituteWithAdmin } from "../controllers/instituteController.js";

const router = express.Router();

// Super Admin only
router.post("/", protect, allowRoles("SUPER_ADMIN"), createInstitute);
router.get("/", protect, allowRoles("SUPER_ADMIN"), getAllInstitutes);
router.patch("/:id/status", protect, allowRoles("SUPER_ADMIN"), updateInstituteStatus);
router.patch("/:id/plan", protect, allowRoles("SUPER_ADMIN"), updateInstitutePlan);
router.post("/:id/admin", protect, allowRoles("SUPER_ADMIN"), assignInstituteAdmin);
router.post("/create-with-admin", protect, allowRoles("SUPER_ADMIN"), createInstituteWithAdmin);

// Super Admin or same institute
router.get(
  "/:id",
  protect,
  allowRoles("SUPER_ADMIN", "INSTITUTE_ADMIN"),
  requireSameInstituteOrSuperAdmin,
  getInstituteById
);

router.put(
  "/:id",
  protect,
  allowRoles("SUPER_ADMIN", "INSTITUTE_ADMIN"),
  requireSameInstituteOrSuperAdmin,
  updateInstitute
);

router.get(
  "/:id/users",
  protect,
  allowRoles("SUPER_ADMIN", "INSTITUTE_ADMIN"),
  requireSameInstituteOrSuperAdmin,
  getInstituteUsers
);

// Logged-in user's institute
router.get(
  "/me/details",
  protect,
  allowRoles("INSTITUTE_ADMIN", "TEACHER", "STUDENT"),
  getMyInstitute
);


router.get(
  "/admin/certificates",
  protect,
  allowRoles("INSTITUTE_ADMIN"),
  getInstituteCertificates
);

router.get(
  "/admin/reports/overview",
  protect,
  allowRoles("INSTITUTE_ADMIN"),
  getInstituteReportsOverview
);


export default router;