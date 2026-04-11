import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddlewares.js";
import {
  generateCertificateForCourse,
  getMyCertificates,
  getCertificateById,
  getCertificateEligibility,
  getInstituteCertificates, 
} from "../controllers/certificateController.js";

const router = express.Router();

router.use(protect);

router.get("/my", allowRoles("STUDENT"), getMyCertificates);
router.get("/course/:courseId/eligibility", allowRoles("STUDENT"), getCertificateEligibility);
router.post("/course/:courseId/generate", allowRoles("STUDENT"), generateCertificateForCourse);
router.get("/:certificateId", allowRoles("STUDENT", "INSTITUTE_ADMIN", "TEACHER"), getCertificateById);
router.get("/institute/all", allowRoles("INSTITUTE_ADMIN"), getInstituteCertificates);  

export default router;