import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import bcrypt from "bcryptjs";
import crypto_node from "crypto";

// ₹0 for STARTER (free), paid plans need payment
const PLAN_PRICES = {
  STARTER: 0,
  PROFESSIONAL: 299900,  // ₹2999 in paise
  ENTERPRISE: 799900,    // ₹7999 in paise
};

// ─── STEP 1 of signup: Create Razorpay order for plan ─────────────────────────
// Called BEFORE institute is created. We store pendingSignup data in the order notes.
export const createPlanOrder = async (req, res) => {
  try {
    const { planType, name, email, password, instituteName, subdomain } = req.body;

    const validPlans = ["STARTER", "PROFESSIONAL", "ENTERPRISE"];
    if (!validPlans.includes(planType)) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    // STARTER is free — no payment needed, handled directly by signup
    if (planType === "STARTER") {
      return res.json({ success: true, free: true });
    }

    const amount = PLAN_PRICES[planType];

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `plan_${subdomain}_${Date.now()}`,
      notes: { planType, instituteName, subdomain, adminName: name, adminEmail: email },
    });

    return res.json({
      success: true,
      free: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to create plan order" });
  }
};

// ─── STEP 2 of signup: Verify plan payment then complete signup ───────────────
export const verifyPlanPaymentAndSignup = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // signup data passed from frontend
      name, email, password, instituteName, subdomain, planType,
      primaryColor, secondaryColor, logoUrl,
    } = req.body;

    // 1. Verify signature
    const expectedSig = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 2. Check subdomain not taken
    const existing = await prisma.institute.findUnique({ where: { subdomain } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Subdomain already exists." });
    }

    // 3. Create institute + user in transaction
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerifyToken = crypto_node.randomBytes(32).toString("hex");
    const emailVerifyTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);

    const result = await prisma.$transaction(async (tx) => {
      const institute = await tx.institute.create({
        data: {
          name: instituteName,
          subdomain,
          plan: planType,
          primaryColor: primaryColor || null,
          secondaryColor: secondaryColor || null,
          logoUrl: logoUrl || null,
          storageLimitMb: planType === "PROFESSIONAL" ? 10240 : 51200,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: "INSTITUTE_ADMIN",
          instituteId: institute.id,
          isEmailVerified: false,
          emailVerifyToken,
          emailVerifyTokenExpiry,
        },
      });

      // Record the payment
      await tx.payment.create({
        data: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: PLAN_PRICES[planType] / 100,
          paymentFor: "PLAN_SUBSCRIPTION",
          status: "CAPTURED",
          planType,
          instituteId: institute.id,
          userId: user.id,
        },
      });

      return { institute, user };
    });

    return res.status(201).json({
      success: true,
      message: "Payment verified. Signup complete. Please verify your email.",
      data: {
        user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role },
        institute: { id: result.institute.id, name: result.institute.name, subdomain: result.institute.subdomain, plan: result.institute.plan },
      },
      devInfo: process.env.NODE_ENV !== "production" ? { emailVerifyToken } : undefined,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Signup after payment failed" });
  }
};

// ─── Course enrollment order ──────────────────────────────────────────────────
export const createCourseOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id || req.user?.userId;
    const instituteId = req.user?.instituteId;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // Free course — return signal to enroll directly
    if (!course.price || course.price === 0) {
      return res.json({ success: true, free: true });
    }

    const amount = Math.round(course.price * 100);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `course_${courseId}_${userId}_${Date.now()}`,
      notes: { courseId, userId },
    });

    await prisma.payment.create({
      data: {
        razorpayOrderId: order.id,
        amount: course.price,
        paymentFor: "COURSE_ENROLLMENT",
        status: "PENDING",
        courseId,
        instituteId,
        userId,
      },
    });

    return res.json({
      success: true,
      free: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to create course order" });
  }
};

// ─── Verify course payment and enroll ────────────────────────────────────────
export const verifyCoursePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?.id || req.user?.userId;

    const expectedSig = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      await prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: "FAILED" },
      });
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: "CAPTURED" },
      });
      await tx.courseEnrollment.upsert({
        where: { studentId_courseId: { studentId: userId, courseId: payment.courseId } },
        create: { studentId: userId, courseId: payment.courseId },
        update: {},
      });
    });

    return res.json({ success: true, message: "Payment verified. Enrolled successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Verification error" });
  }
};

// ─── Payment history ──────────────────────────────────────────────────────────
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const role = req.user?.role;
    const instituteId = req.user?.instituteId;

    const where =
      role === "SUPER_ADMIN" ? {} :
      role === "INSTITUTE_ADMIN" ? { instituteId } :
      { userId };

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    });

    return res.json({ success: true, data: payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};