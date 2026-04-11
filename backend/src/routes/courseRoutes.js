import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddlewares.js";
import {
  createCourse,
  getInstituteCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getMyEnrolledCourses,
  markLessonComplete,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect);

router.post("/", allowRoles("INSTITUTE_ADMIN"), createCourse);

router.get("/", allowRoles("INSTITUTE_ADMIN", "TEACHER", "STUDENT"), getInstituteCourses);
router.get("/my-courses", allowRoles("STUDENT"), getMyEnrolledCourses);
router.get("/:id", allowRoles("INSTITUTE_ADMIN", "TEACHER", "STUDENT"), getCourseById);

router.post("/:courseId/enroll", allowRoles("STUDENT"), enrollInCourse);
router.post("/lessons/:lessonId/complete", allowRoles("STUDENT"), markLessonComplete);

router.put("/:id", allowRoles("INSTITUTE_ADMIN"), updateCourse);
router.delete("/:id", allowRoles("INSTITUTE_ADMIN"), deleteCourse);

export default router;