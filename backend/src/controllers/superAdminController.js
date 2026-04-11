import {prisma} from "../config/prisma.js";
import bcrypt from "bcryptjs";

// CREATE INSTITUTE + ADMIN


export const createInstitute = async (req, res) => {
  try {
    const {
      name,
      subdomain,
      adminName,
      adminEmail,
      adminPassword,
      plan,
    } = req.body;

    // check duplicate
    const existing = await prisma.institute.findUnique({
      where: { subdomain },
    });

    if (existing) {
      return res.status(400).json({ message: "Subdomain exists" });
    }

    const hashed = await bcrypt.hash(adminPassword, 10);

    // ✅ STEP 1: create institute
    const institute = await prisma.institute.create({
      data: {
        name,
        subdomain,
        plan,
      },
    });

    // ✅ STEP 2: create admin linked to institute
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashed,
        role: "INSTITUTE_ADMIN",
        instituteId: institute.id, // 🔥 THIS IS THE IMPORTANT LINE
        isEmailVerified: true,
      },
    });

    res.status(201).json(institute);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Create failed" });
  }
};

// GET ALL INSTITUTES
export const getAllInstitutes = async (req, res) => {
  const data = await prisma.institute.findMany({
    include: {
      users: true,
      courses: true,
    },
  });

  res.json(data);
};

// GET SINGLE
export const getInstitute = async (req, res) => {
  const { id } = req.params;

  const inst = await prisma.institute.findUnique({
    where: { id },
    include: {
      users: true,
      courses: true,
    },
  });

  res.json(inst);
};

// UPDATE (PLAN / STATUS / STORAGE)
export const updateInstitute = async (req, res) => {
  const { id } = req.params;
  const { plan, status, storageLimitMb } = req.body;

  const updated = await prisma.institute.update({
    where: { id },
    data: {
      plan,
      status,
      storageLimitMb,
    },
  });

  res.json(updated);
};

// ANALYTICS
export const getAnalytics = async (req, res) => {
  const totalInstitutes = await prisma.institute.count();
  const totalUsers = await prisma.user.count();
  const totalCourses = await prisma.course.count();

  const plans = await prisma.institute.groupBy({
    by: ["plan"],
    _count: true,
  });

  // fake revenue (since no payment yet)
  let revenue = 0;

  plans.forEach((p) => {
    if (p.plan === "STARTER") revenue += p._count * 999;
    if (p.plan === "PROFESSIONAL") revenue += p._count * 3499;
    if (p.plan === "ENTERPRISE") revenue += p._count * 8000;
  });

  res.json({
    totalInstitutes,
    totalUsers,
    totalCourses,
    revenue,
    plans,
  });
};