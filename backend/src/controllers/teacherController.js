import { prisma } from "../config/prisma.js";

const getCurrentUserId = (req) => req.user?.id || req.user?.userId;

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID missing in token.",
      });
    }

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const courseWhere = {
      instituteId,
      teacherId,
    };

    const [
      assignedCourses,
      publishedCourses,
      draftCourses,
      modulesCount,
      lessonsCount,
      recentCourses,
    ] = await Promise.all([
      prisma.course.count({
        where: courseWhere,
      }),
      prisma.course.count({
        where: {
          ...courseWhere,
          status: "PUBLISHED",
        },
      }),
      prisma.course.count({
        where: {
          ...courseWhere,
          status: "DRAFT",
        },
      }),
      prisma.courseModule.count({
        where: {
          course: courseWhere,
        },
      }),
      prisma.lesson.count({
        where: {
          module: {
            course: courseWhere,
          },
        },
      }),
      prisma.course.findMany({
        where: courseWhere,
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
        include: {
          _count: {
            select: {
              modules: true,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          assignedCourses,
          publishedCourses,
          draftCourses,
          modulesCount,
          lessonsCount,
        },
        recentCourses,
      },
    });
  } catch (error) {
    console.error("Get teacher dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load teacher dashboard",
    });
  }
};

export const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID missing in token.",
      });
    }

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const courses = await prisma.course.findMany({
      where: {
        instituteId,
        teacherId,
      },
      include: {
        _count: {
          select: {
            modules: true,
          },
        },
        modules: {
          include: {
            _count: {
              select: {
                lessons: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Get teacher courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch teacher courses",
    });
  }
};

export const getTeacherCourseById = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { courseId } = req.params;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID missing in token.",
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instituteId,
        teacherId,
      },
      include: {
        modules: {
          orderBy: {
            order: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or not assigned to this teacher",
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get teacher course by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course details",
    });
  }
};

export const createModule = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { courseId } = req.params;
    const { title, order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Module title is required",
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instituteId,
        teacherId,
      },
      include: {
        modules: {
          orderBy: {
            order: "desc",
          },
          take: 1,
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or not assigned to this teacher",
      });
    }

    const nextOrder =
      typeof order === "number"
        ? order
        : course.modules.length > 0
        ? course.modules[0].order + 1
        : 1;

    const moduleData = await prisma.courseModule.create({
      data: {
        title: title.trim(),
        order: nextOrder,
        courseId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: moduleData,
    });
  } catch (error) {
    console.error("Create module error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create module",
    });
  }
};

export const updateModule = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { moduleId } = req.params;
    const { title, order } = req.body;

    const existingModule = await prisma.courseModule.findFirst({
      where: {
        id: moduleId,
        course: {
          instituteId,
          teacherId,
        },
      },
    });

    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found or access denied",
      });
    }

    const updatedModule = await prisma.courseModule.update({
      where: { id: moduleId },
      data: {
        title:
          typeof title === "string" && title.trim()
            ? title.trim()
            : existingModule.title,
        order: typeof order === "number" ? order : existingModule.order,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: updatedModule,
    });
  } catch (error) {
    console.error("Update module error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update module",
    });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { moduleId } = req.params;

    const existingModule = await prisma.courseModule.findFirst({
      where: {
        id: moduleId,
        course: {
          instituteId,
          teacherId,
        },
      },
    });

    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found or access denied",
      });
    }

    await prisma.courseModule.delete({
      where: { id: moduleId },
    });

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("Delete module error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete module",
    });
  }
};

export const createLesson = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { moduleId } = req.params;
    const { title, type, content, videoUrl, pdfUrl, order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Lesson title is required",
      });
    }

    if (!type || !["VIDEO", "PDF", "TEXT"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Valid lesson type is required",
      });
    }

    if (type === "TEXT" && !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text content is required for TEXT lessons",
      });
    }

    if (type === "VIDEO" && !videoUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required for VIDEO lessons",
      });
    }

    if (type === "PDF" && !pdfUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "PDF URL is required for PDF lessons",
      });
    }

    const existingModule = await prisma.courseModule.findFirst({
      where: {
        id: moduleId,
        course: {
          instituteId,
          teacherId,
        },
      },
      include: {
        lessons: {
          orderBy: {
            order: "desc",
          },
          take: 1,
        },
      },
    });

    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found or access denied",
      });
    }

    const nextOrder =
      typeof order === "number"
        ? order
        : existingModule.lessons.length > 0
        ? existingModule.lessons[0].order + 1
        : 1;

    const lesson = await prisma.lesson.create({
      data: {
        title: title.trim(),
        type,
        content: type === "TEXT" ? content.trim() : null,
        videoUrl: type === "VIDEO" ? videoUrl.trim() : null,
        pdfUrl: type === "PDF" ? pdfUrl.trim() : null,
        order: nextOrder,
        moduleId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    console.error("Create lesson error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create lesson",
    });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { lessonId } = req.params;
    const { title, type, content, videoUrl, pdfUrl, order } = req.body;

    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instituteId,
            teacherId,
          },
        },
      },
    });

    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found or access denied",
      });
    }

    const nextType = type || existingLesson.type;

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title:
          typeof title === "string" && title.trim()
            ? title.trim()
            : existingLesson.title,
        type: nextType,
        content:
          nextType === "TEXT"
            ? content !== undefined
              ? String(content).trim()
              : existingLesson.content
            : null,
        videoUrl:
          nextType === "VIDEO"
            ? videoUrl !== undefined
              ? String(videoUrl).trim()
              : existingLesson.videoUrl
            : null,
        pdfUrl:
          nextType === "PDF"
            ? pdfUrl !== undefined
              ? String(pdfUrl).trim()
              : existingLesson.pdfUrl
            : null,
        order: typeof order === "number" ? order : existingLesson.order,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: updatedLesson,
    });
  } catch (error) {
    console.error("Update lesson error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lesson",
    });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { lessonId } = req.params;

    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instituteId,
            teacherId,
          },
        },
      },
    });

    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found or access denied",
      });
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete lesson",
    });
  }
};

export const uploadPdf = async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const fileUrl = `http://localhost:5000/uploads/pdfs/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "PDF uploaded successfully",
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error("Upload PDF error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload PDF",
    });
  }
};

// ── NEW: Video Upload ─────────────────────────────────────────────────────────

export const uploadVideo = async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required",
      });
    }

    const fileUrl = `http://localhost:5000/uploads/videos/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error("Upload video error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload video",
    });
  }
};

export const getTeacherCourseStudentsProgress = async (req, res) => {
  try {
    const teacherId = getCurrentUserId(req);
    const instituteId = req.user?.instituteId;
    const { courseId } = req.params;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID missing in token.",
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instituteId,
        teacherId,
      },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
              },
            },
          },
          orderBy: {
            enrolledAt: "desc",
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or not assigned to this teacher",
      });
    }

    const lessonIds = course.modules.flatMap((module) =>
      module.lessons.map((lesson) => lesson.id)
    );

    const totalLessons = lessonIds.length;

    const studentIds = course.enrollments.map((enrollment) => enrollment.studentId);

    const progressRecords =
      studentIds.length > 0 && lessonIds.length > 0
        ? await prisma.lessonProgress.findMany({
            where: {
              studentId: { in: studentIds },
              lessonId: { in: lessonIds },
              completed: true,
            },
            select: {
              studentId: true,
              lessonId: true,
              completed: true,
              completedAt: true,
            },
          })
        : [];

    const progressMap = new Map();

    for (const record of progressRecords) {
      if (!progressMap.has(record.studentId)) {
        progressMap.set(record.studentId, 0);
      }
      progressMap.set(record.studentId, progressMap.get(record.studentId) + 1);
    }

    const students = course.enrollments.map((enrollment) => {
      const completedLessons = progressMap.get(enrollment.studentId) || 0;
      const completionPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      let status = "NOT_STARTED";
      if (completedLessons > 0 && completedLessons < totalLessons) {
        status = "IN_PROGRESS";
      }
      if (totalLessons > 0 && completedLessons === totalLessons) {
        status = "COMPLETED";
      }

      return {
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        student: enrollment.student,
        completedLessons,
        totalLessons,
        completionPercentage,
        status,
      };
    });

    const averageCompletion =
      students.length > 0
        ? Math.round(
            students.reduce((sum, student) => sum + student.completionPercentage, 0) /
              students.length
          )
        : 0;

    const completedStudents = students.filter(
      (student) => student.status === "COMPLETED"
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          category: course.category,
          status: course.status,
        },
        summary: {
          totalEnrollments: students.length,
          totalLessons,
          averageCompletion,
          completedStudents,
        },
        students,
      },
    });
  } catch (error) {
    console.error("Get teacher course students progress error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled students progress",
    });
  }
};