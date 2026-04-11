import bcrypt from "bcryptjs";
import {prisma} from "../config/prisma.js";

const getStorageLimitByPlan = (plan) => {
  switch (plan) {
    case "STARTER":
      return 1024; // 1 GB
    case "PROFESSIONAL":
      return 10240; // 10 GB
    case "ENTERPRISE":
      return 51200; // 50 GB
    default:
      return 1024;
  }
};

export const createInstitute = async (req, res) => {
  try {
    const {
      name,
      subdomain,
      logoUrl,
      primaryColor,
      secondaryColor,
      plan = "STARTER",
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    if (!name || !subdomain || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Institute name, subdomain, admin name, admin email, and admin password are required.",
      });
    }

    const normalizedSubdomain = subdomain.trim().toLowerCase();

    const existingInstitute = await prisma.institute.findUnique({
      where: { subdomain: normalizedSubdomain },
    });

    if (existingInstitute) {
      return res.status(409).json({
        success: false,
        message: "Subdomain already exists.",
      });
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase() },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const institute = await prisma.institute.create({
      data: {
        name: name.trim(),
        subdomain: normalizedSubdomain,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
        plan,
        storageLimitMb: getStorageLimitByPlan(plan),
        users: {
          create: {
            name: adminName.trim(),
            email: adminEmail.toLowerCase(),
            password: hashedPassword,
            role: "INSTITUTE_ADMIN",
            isEmailVerified: true,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Institute and institute admin created successfully.",
      data: institute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create institute.",
      error: error.message,
    });
  }
};

export const getAllInstitutes = async (req, res) => {
  try {
    const institutes = await prisma.institute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: institutes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch institutes.",
      error: error.message,
    });
  }
};

export const getInstituteById = async (req, res) => {
  try {
    const { id } = req.params;

    const institute = await prisma.institute.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            isEmailVerified: true,
            createdAt: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: institute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch institute.",
      error: error.message,
    });
  }
};

export const updateInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subdomain, logoUrl, primaryColor, secondaryColor } = req.body;

    const institute = await prisma.institute.findUnique({
      where: { id },
    });

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found.",
      });
    }

    if (subdomain && subdomain !== institute.subdomain) {
      const existingSubdomain = await prisma.institute.findUnique({
        where: { subdomain: subdomain.toLowerCase() },
      });

      if (existingSubdomain) {
        return res.status(409).json({
          success: false,
          message: "Subdomain already exists.",
        });
      }
    }

    const updatedInstitute = await prisma.institute.update({
      where: { id },
      data: {
        name: name ?? institute.name,
        subdomain: subdomain ? subdomain.toLowerCase() : institute.subdomain,
        logoUrl: logoUrl ?? institute.logoUrl,
        primaryColor: primaryColor ?? institute.primaryColor,
        secondaryColor: secondaryColor ?? institute.secondaryColor,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Institute updated successfully.",
      data: updatedInstitute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update institute.",
      error: error.message,
    });
  }
};

export const updateInstituteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid institute status.",
      });
    }

    const updatedInstitute = await prisma.institute.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      message: "Institute status updated successfully.",
      data: updatedInstitute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update institute status.",
      error: error.message,
    });
  }
};

export const updateInstitutePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    const validPlans = ["STARTER", "PROFESSIONAL", "ENTERPRISE"];

    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type.",
      });
    }

    const updatedInstitute = await prisma.institute.update({
      where: { id },
      data: {
        plan,
        storageLimitMb: getStorageLimitByPlan(plan),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Institute plan updated successfully.",
      data: updatedInstitute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update institute plan.",
      error: error.message,
    });
  }
};

export const assignInstituteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const institute = await prisma.institute.findUnique({
      where: { id },
    });

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "INSTITUTE_ADMIN",
        instituteId: id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Institute admin assigned successfully.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign institute admin.",
      error: error.message,
    });
  }
};

export const getInstituteUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await prisma.user.findMany({
      where: { instituteId: id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch institute users.",
      error: error.message,
    });
  }
};

export const getMyInstitute = async (req, res) => {
  try {
    if (!req.user?.instituteId) {
      return res.status(404).json({
        success: false,
        message: "No institute mapped to this user.",
      });
    }

    const institute = await prisma.institute.findUnique({
      where: { id: req.user.instituteId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: institute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your institute.",
      error: error.message,
    });
  }
};

export const getInstituteCertificates = async (req, res) => {
  try {
    const instituteId = req.user?.instituteId;
    const { courseId = "", studentSearch = "" } = req.query;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        instituteId,
        ...(courseId ? { courseId } : {}),
        ...(studentSearch
          ? {
              OR: [
                {
                  student: {
                    name: {
                      contains: studentSearch,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  student: {
                    email: {
                      contains: studentSearch,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        institute: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logoUrl: true,
            primaryColor: true,
            secondaryColor: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get institute certificates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch institute certificates",
    });
  }
};

export const getInstituteReportsOverview = async (req, res) => {
  try {
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      publishedCourses,
      totalCertificates,
      totalEnrollments,
      totalLessons,
      totalCompletedProgress,
      courseEnrollments,
      certificatesByCourse,
      recentCertificates,
      recentEnrollments,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          instituteId,
          role: "STUDENT",
        },
      }),
      prisma.user.count({
        where: {
          instituteId,
          role: "TEACHER",
        },
      }),
      prisma.course.count({
        where: {
          instituteId,
        },
      }),
      prisma.course.count({
        where: {
          instituteId,
          status: "PUBLISHED",
        },
      }),
      prisma.certificate.count({
        where: {
          instituteId,
        },
      }),
      prisma.courseEnrollment.count({
        where: {
          course: {
            instituteId,
          },
        },
      }),
      prisma.lesson.count({
        where: {
          module: {
            course: {
              instituteId,
            },
          },
        },
      }),
      prisma.lessonProgress.count({
        where: {
          completed: true,
          lesson: {
            module: {
              course: {
                instituteId,
              },
            },
          },
        },
      }),
      prisma.course.findMany({
        where: {
          instituteId,
        },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          teacher: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              modules: true,
              certificates: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.certificate.groupBy({
        by: ["courseId"],
        where: {
          instituteId,
        },
        _count: {
          _all: true,
        },
      }),
      prisma.certificate.findMany({
        where: {
          instituteId,
        },
        take: 5,
        orderBy: {
          issuedAt: "desc",
        },
        include: {
          student: {
            select: {
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.courseEnrollment.findMany({
        where: {
          course: {
            instituteId,
          },
        },
        take: 5,
        orderBy: {
          enrolledAt: "desc",
        },
        include: {
          student: {
            select: {
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    const completionRate =
      totalLessons > 0 && totalStudents > 0
        ? Math.round((totalCompletedProgress / (totalLessons * totalStudents)) * 100)
        : 0;

    const certificateRate =
      totalEnrollments > 0 ? Math.round((totalCertificates / totalEnrollments) * 100) : 0;

    const topCourses = [...courseEnrollments]
      .sort((a, b) => b._count.enrollments - a._count.enrollments)
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalCourses,
          publishedCourses,
          totalEnrollments,
          totalCertificates,
          totalLessons,
          completionRate,
          certificateRate,
        },
        topCourses,
        recentCertificates,
        recentEnrollments,
      },
    });
  } catch (error) {
    console.error("Get institute reports overview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch institute reports",
    });
  }
};


export const createInstituteWithAdmin = async (req, res) => {
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
      return res.status(400).json({ message: "Subdomain already exists" });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const institute = await prisma.institute.create({
      data: {
        name,
        subdomain,
        plan,
        users: {
          create: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "INSTITUTE_ADMIN",
            isEmailVerified: true,
          },
        },
      },
      include: { users: true },
    });

    res.status(201).json(institute);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create institute" });
  }
};