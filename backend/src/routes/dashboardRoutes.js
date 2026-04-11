import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/super-admin", protect, authorize("SUPER_ADMIN"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Super Admin",
  });
});

router.get("/institute-admin", protect, authorize("INSTITUTE_ADMIN"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Institute Admin",
  });
});

router.get("/teacher", protect, authorize("TEACHER"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Teacher",
  });
});

router.get("/student", protect, authorize("STUDENT"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Student",
  });
});

router.get("/super-admin/analytics", protect, allowRoles("SUPER_ADMIN"), async (req, res) => {
  const totalInstitutes = await prisma.institute.count();
  const totalUsers = await prisma.user.count();
  const totalCourses = await prisma.course.count();

  const planStats = await prisma.institute.groupBy({
    by: ["plan"],
    _count: true,
  });

  res.json({
    totalInstitutes,
    totalUsers,
    totalCourses,
    planStats,
  });
});

export default router;