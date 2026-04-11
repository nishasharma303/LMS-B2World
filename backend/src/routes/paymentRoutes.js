import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createPlanOrder,
  verifyPlanPaymentAndSignup,
  createCourseOrder,
  verifyCoursePayment,
  getPaymentHistory,
} from "../controllers/paymentController.js";

const router = express.Router();

// Public (no auth needed — called during signup before account exists)
router.post("/plan/order", createPlanOrder);
router.post("/plan/verify-and-signup", verifyPlanPaymentAndSignup);

// Authenticated
router.post("/course/order", protect, createCourseOrder);
router.post("/course/verify", protect, verifyCoursePayment);
router.get("/history", protect, getPaymentHistory);

export default router;