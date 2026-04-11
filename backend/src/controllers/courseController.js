import { prisma } from "../config/prisma.js";

const getCurrentUserId = (req) => req.user?.id || req.user?.userId;

export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, category, status, teacherId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course title is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const instituteId = req.user.instituteId;
    const currentUserId = getCurrentUserId(req);

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing in token payload",
      });
    }

    if (teacherId) {
      const teacher = await prisma.user.findFirst({
        where: {
          id: teacherId,
          instituteId,
          role: "TEACHER",
        },
      });

      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: "Assigned teacher not found in this institute",
        });
      }
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        thumbnail: thumbnail?.trim() || null,
        category: category?.trim() || null,
        status: status || "DRAFT",
        institute: {
          connect: { id: instituteId },
        },
        createdBy: {
          connect: { id: currentUserId },
        },
        ...(teacherId
          ? {
              teacher: {
                connect: { id: teacherId },
              },
            }
          : {}),
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

export const getInstituteCourses = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const instituteId = req.user.instituteId;
    const currentUserId = getCurrentUserId(req);
    const userRole = req.user.role;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const whereClause = { instituteId };

    if (userRole === "TEACHER") {
      whereClause.teacherId = currentUserId;
    }

    if (userRole === "STUDENT") {
      whereClause.status = "PUBLISHED";
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
        enrollments:
          userRole === "STUDENT"
            ? {
                where: { studentId: currentUserId },
                select: { id: true, enrolledAt: true },
              }
            : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedCourses =
      userRole === "STUDENT"
        ? courses.map((course) => ({
            ...course,
            isEnrolled: course.enrollments.length > 0,
            enrolledAt: course.enrollments[0]?.enrolledAt || null,
          }))
        : courses;

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: formattedCourses,
    });
  } catch (error) {
    console.error("Get institute courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const instituteId = req.user.instituteId;
    const currentUserId = getCurrentUserId(req);
    const userRole = req.user.role;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const baseWhere = {
      id,
      instituteId,
    };

    if (userRole === "TEACHER") {
      baseWhere.teacherId = currentUserId;
    }

    if (userRole === "STUDENT") {
      const enrolled = await prisma.courseEnrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: currentUserId,
            courseId: id,
          },
        },
      });

      if (!enrolled) {
        const previewCourse = await prisma.course.findFirst({
          where: {
            id,
            instituteId,
            status: "PUBLISHED",
          },
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                modules: true,
                enrollments: true,
              },
            },
          },
        });

        if (!previewCourse) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        return res.status(403).json({
          success: false,
          message: "You must enroll in this course to access its content",
          data: {
            id: previewCourse.id,
            title: previewCourse.title,
            description: previewCourse.description,
            thumbnail: previewCourse.thumbnail,
            category: previewCourse.category,
            status: previewCourse.status,
            teacher: previewCourse.teacher,
            _count: previewCourse._count,
            isEnrolled: false,
          },
        });
      }
    }

    const course = await prisma.course.findFirst({
      where: userRole === "STUDENT" ? { id, instituteId, status: "PUBLISHED" } : baseWhere,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        modules: {
          orderBy: {
            order: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
              include:
                userRole === "STUDENT"
                  ? {
                      progress: {
                        where: {
                          studentId: currentUserId,
                        },
                        select: {
                          id: true,
                          completed: true,
                          completedAt: true,
                        },
                      },
                    }
                  : undefined,
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const formattedCourse =
      userRole === "STUDENT"
        ? {
            ...course,
            isEnrolled: true,
            modules: course.modules.map((module) => ({
              ...module,
              lessons: module.lessons.map((lesson) => ({
                ...lesson,
                completed: lesson.progress?.[0]?.completed || false,
                completedAt: lesson.progress?.[0]?.completedAt || null,
              })),
            })),
          }
        : course;

    return res.status(200).json({
      success: true,
      message: "Course fetched successfully",
      data: formattedCourse,
    });
  } catch (error) {
    console.error("Get course by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail, category, status, teacherId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const instituteId = req.user.instituteId;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const existingCourse = await prisma.course.findFirst({
      where: {
        id,
        instituteId,
      },
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (teacherId) {
      const teacher = await prisma.user.findFirst({
        where: {
          id: teacherId,
          instituteId,
          role: "TEACHER",
        },
      });

      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: "Assigned teacher not found in this institute",
        });
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existingCourse.title,
        description:
          description !== undefined
            ? description?.trim() || null
            : existingCourse.description,
        thumbnail:
          thumbnail !== undefined
            ? thumbnail?.trim() || null
            : existingCourse.thumbnail,
        category:
          category !== undefined
            ? category?.trim() || null
            : existingCourse.category,
        status: status !== undefined ? status : existingCourse.status,
        ...(teacherId !== undefined
          ? teacherId
            ? {
                teacher: {
                  connect: { id: teacherId },
                },
              }
            : {
                teacher: {
                  disconnect: true,
                },
              }
          : {}),
        updatedAt: new Date(),
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const instituteId = req.user.instituteId;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const existingCourse = await prisma.course.findFirst({
      where: {
        id,
        instituteId,
      },
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await prisma.course.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const studentId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { courseId } = req.params;

    if (!studentId || req.user?.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can enroll in courses",
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instituteId,
        status: "PUBLISHED",
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found in this institute",
      });
    }

    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Enrolled in course successfully",
      data: enrollment,
    });
  } catch (error) {
    console.error("Enroll in course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enroll in course",
    });
  }
};

export const getMyEnrolledCourses = async (req, res) => {
  try {
    const studentId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;

    if (!studentId || req.user?.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can access enrolled courses",
      });
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId,
        course: {
          instituteId,
        },
      },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                modules: true,
                enrollments: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    const data = enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      enrolledAt: enrollment.enrolledAt,
      ...enrollment.course,
      isEnrolled: true,
    }));

    return res.status(200).json({
      success: true,
      message: "Enrolled courses fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get my enrolled courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses",
    });
  }
};

export const markLessonComplete = async (req, res) => {
  try {
    const studentId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { lessonId } = req.params;

    if (!studentId || req.user?.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can update lesson progress",
      });
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instituteId,
            enrollments: {
              some: {
                studentId,
              },
            },
          },
        },
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found or course access denied",
      });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        studentId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Lesson marked as completed",
      data: progress,
    });
  } catch (error) {
    console.error("Mark lesson complete error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lesson progress",
    });
  }
};