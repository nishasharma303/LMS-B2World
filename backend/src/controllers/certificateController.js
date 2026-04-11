import crypto from "crypto";
import { prisma } from "../config/prisma.js";

const getCurrentUserId = (req) => req.user?.id || req.user?.userId;

const buildCertificateNo = () => {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CERT-${Date.now()}-${random}`;
};

const getStudentCourseCompletion = async ({ studentId, courseId, instituteId }) => {
  const enrollment = await prisma.courseEnrollment.findFirst({
    where: {
      studentId,
      courseId,
      course: {
        instituteId,
        status: "PUBLISHED",
      },
    },
    include: {
      course: {
        include: {
          institute: true,
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          instituteId: true,
        },
      },
    },
  });

  if (!enrollment) {
    return { enrollment: null, totalLessons: 0, completedLessons: 0, percentage: 0 };
  }

  const lessonIds = enrollment.course.modules.flatMap((module) =>
    module.lessons.map((lesson) => lesson.id)
  );

  const totalLessons = lessonIds.length;

  const completedLessons = totalLessons
    ? await prisma.lessonProgress.count({
        where: {
          studentId,
          lessonId: { in: lessonIds },
          completed: true,
        },
      })
    : 0;

  const percentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    enrollment,
    totalLessons,
    completedLessons,
    percentage,
  };
};

export const generateCertificateForCourse = async (req, res) => {
  try {
    const studentId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const role = req.user?.role;
    const { courseId } = req.params;

    if (role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can generate certificates",
      });
    }

    const progress = await getStudentCourseCompletion({
      studentId,
      courseId,
      instituteId,
    });

    if (!progress.enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrolled course not found",
      });
    }

    if (progress.totalLessons === 0) {
      return res.status(400).json({
        success: false,
        message: "Certificate cannot be generated because this course has no lessons yet",
      });
    }

    if (progress.completedLessons < progress.totalLessons) {
      return res.status(400).json({
        success: false,
        message: "Complete all lessons before generating the certificate",
        data: {
          completedLessons: progress.completedLessons,
          totalLessons: progress.totalLessons,
          percentage: progress.percentage,
        },
      });
    }

    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      include: {
        course: true,
        institute: true,
        student: true,
      },
    });

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        message: "Certificate already generated",
        data: existingCertificate,
      });
    }

    const certificate = await prisma.certificate.create({
      data: {
        certificateNo: buildCertificateNo(),
        studentId,
        courseId,
        instituteId,
      },
      include: {
        course: true,
        institute: true,
        student: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: certificate,
    });
  } catch (error) {
    console.error("Generate certificate error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate certificate",
    });
  }
};

export const getMyCertificates = async (req, res) => {
  try {
    const studentId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;

    if (req.user?.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can access certificates",
      });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        studentId,
        instituteId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            teacher: {
              select: {
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
    console.error("Get my certificates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
    });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const role = req.user?.role;
    const { certificateId } = req.params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        instituteId,
        ...(role === "STUDENT" ? { studentId: currentUserId } : {}),
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
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error("Get certificate by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificate",
    });
  }
};

export const getCertificateEligibility = async (req, res) => {
  try {
    const studentId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { courseId } = req.params;

    if (req.user?.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can check certificate eligibility",
      });
    }

    const progress = await getStudentCourseCompletion({
      studentId,
      courseId,
      instituteId,
    });

    if (!progress.enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrolled course not found",
      });
    }

    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      select: {
        id: true,
        certificateNo: true,
        issuedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        eligible:
          progress.totalLessons > 0 &&
          progress.completedLessons === progress.totalLessons,
        totalLessons: progress.totalLessons,
        completedLessons: progress.completedLessons,
        percentage: progress.percentage,
        certificate: existingCertificate || null,
      },
    });
  } catch (error) {
    console.error("Get certificate eligibility error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check certificate eligibility",
    });
  }
};

export const getInstituteCertificates = async (req, res) => {
  try {
    const instituteId = req.user?.instituteId;
    const role = req.user?.role;

    if (role !== "INSTITUTE_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only institute admins can access this.",
      });
    }

    const { studentSearch } = req.query;

    const certificates = await prisma.certificate.findMany({
      where: {
        instituteId,
        ...(studentSearch
          ? {
              student: {
                OR: [
                  { name: { contains: studentSearch, mode: "insensitive" } },
                  { email: { contains: studentSearch, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            teacher: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get institute certificates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
    });
  }
};