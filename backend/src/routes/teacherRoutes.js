import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddlewares.js";
import { uploadPdfFile, uploadVideoFile } from "../middlewares/uploadMiddleware.js";

import {
  getTeacherDashboard,
  getTeacherCourses,
  getTeacherCourseById,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadPdf,
  uploadVideo,
  getTeacherCourseStudentsProgress,
} from "../controllers/teacherController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("TEACHER"));

router.get("/dashboard", getTeacherDashboard);
router.get("/courses", getTeacherCourses);
router.get("/courses/:courseId", getTeacherCourseById);
router.get("/courses/:courseId/students", getTeacherCourseStudentsProgress);

router.post("/upload/pdf", uploadPdfFile.single("file"), uploadPdf);
router.post("/upload/video", uploadVideoFile.single("file"), uploadVideo);

router.post("/courses/:courseId/modules", createModule);
router.put("/modules/:moduleId", updateModule);
router.delete("/modules/:moduleId", deleteModule);

router.post("/modules/:moduleId/lessons", createLesson);
router.put("/lessons/:lessonId", updateLesson);
router.delete("/lessons/:lessonId", deleteLesson);

export default router;