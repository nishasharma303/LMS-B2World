import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  instituteId: user.instituteId,
  isActive: user.isActive,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  teachingCourses:
    user.role === "TEACHER" && user.teachingCourses
      ? user.teachingCourses.map((course) => ({
          id: course.id,
          title: course.title,
          category: course.category,
          status: course.status,
        }))
      : [],
});

const syncTeacherCourses = async ({ teacherId, instituteId, courseIds = [] }) => {
  const uniqueCourseIds = [...new Set((courseIds || []).filter(Boolean))];

  const validCourses = uniqueCourseIds.length
    ? await prisma.course.findMany({
        where: {
          id: { in: uniqueCourseIds },
          instituteId,
        },
        select: { id: true },
      })
    : [];

  if (uniqueCourseIds.length !== validCourses.length) {
    throw new Error("One or more selected courses are invalid for this institute");
  }

  await prisma.$transaction([
    prisma.course.updateMany({
      where: {
        instituteId,
        teacherId,
        id: {
          notIn: uniqueCourseIds.length ? uniqueCourseIds : ["__none__"],
        },
      },
      data: {
        teacherId: null,
        updatedAt: new Date(),
      },
    }),
    ...(uniqueCourseIds.length
      ? [
          prisma.course.updateMany({
            where: {
              instituteId,
              id: { in: uniqueCourseIds },
            },
            data: {
              teacherId,
              updatedAt: new Date(),
            },
          }),
        ]
      : []),
  ]);
};

export const getInstituteUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const allowedRoles = ["TEACHER", "STUDENT"];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role query is required (TEACHER or STUDENT)",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        instituteId,
        role,
      },
      orderBy: {
        createdAt: "desc",
      },
      include:
        role === "TEACHER"
          ? {
              teachingCourses: {
                where: { instituteId },
                orderBy: { title: "asc" },
                select: {
                  id: true,
                  title: true,
                  category: true,
                  status: true,
                },
              },
            }
          : undefined,
    });

    return res.status(200).json({
      success: true,
      data: users.map(sanitizeUser),
    });
  } catch (error) {
    console.error("Get institute users by role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const createInstituteUser = async (req, res) => {
  try {
    const { name, email, password, role, courseIds = [] } = req.body;
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    if (!name || !name.trim() || !email || !email.trim() || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
    }

    const allowedRoles = ["TEACHER", "STUDENT"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be TEACHER or STUDENT",
      });
    }

    if (role === "STUDENT" && Array.isArray(courseIds) && courseIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Student course assignment is not supported yet",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
        instituteId,
        isActive: true,
      },
      include:
        role === "TEACHER"
          ? {
              teachingCourses: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  status: true,
                },
              },
            }
          : undefined,
    });

    if (role === "TEACHER") {
      await syncTeacherCourses({
        teacherId: user.id,
        instituteId,
        courseIds,
      });
    }

    const refreshedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include:
        role === "TEACHER"
          ? {
              teachingCourses: {
                where: { instituteId },
                orderBy: { title: "asc" },
                select: {
                  id: true,
                  title: true,
                  category: true,
                  status: true,
                },
              },
            }
          : undefined,
    });

    return res.status(201).json({
      success: true,
      message: `${role === "TEACHER" ? "Teacher" : "Student"} created successfully`,
      data: sanitizeUser(refreshedUser),
    });
  } catch (error) {
    console.error("Create institute user error:", error);

    if (error.message === "One or more selected courses are invalid for this institute") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

export const updateInstituteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, isActive, courseIds } = req.body;
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        instituteId,
        role: {
          in: ["TEACHER", "STUDENT"],
        },
      },
      include: {
        teachingCourses: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
          },
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      typeof email === "string" &&
      email.trim().toLowerCase() !== existingUser.email
    ) {
      const emailExists = await prisma.user.findUnique({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Another user with this email already exists",
        });
      }
    }

    if (
      existingUser.role === "STUDENT" &&
      Array.isArray(courseIds) &&
      courseIds.length > 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Student course assignment is not supported yet",
      });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    if (typeof email === "string" && email.trim()) {
      updateData.email = email.trim().toLowerCase();
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (typeof password === "string" && password.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (existingUser.role === "TEACHER" && Array.isArray(courseIds)) {
      await syncTeacherCourses({
        teacherId: id,
        instituteId,
        courseIds,
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include:
        existingUser.role === "TEACHER"
          ? {
              teachingCourses: {
                where: { instituteId },
                orderBy: { title: "asc" },
                select: {
                  id: true,
                  title: true,
                  category: true,
                  status: true,
                },
              },
            }
          : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("Update institute user error:", error);

    if (error.message === "One or more selected courses are invalid for this institute") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

export const toggleInstituteUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        instituteId,
        role: {
          in: ["TEACHER", "STUDENT"],
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: !existingUser.isActive,
        updatedAt: new Date(),
      },
      include:
        existingUser.role === "TEACHER"
          ? {
              teachingCourses: {
                where: { instituteId },
                orderBy: { title: "asc" },
                select: {
                  id: true,
                  title: true,
                  category: true,
                  status: true,
                },
              },
            }
          : undefined,
    });

    return res.status(200).json({
      success: true,
      message: `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully`,
      data: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("Toggle institute user status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

export const deleteInstituteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute context missing for this user",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        instituteId,
        role: {
          in: ["TEACHER", "STUDENT"],
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingUser.role === "TEACHER") {
      await prisma.course.updateMany({
        where: {
          instituteId,
          teacherId: id,
        },
        data: {
          teacherId: null,
          updatedAt: new Date(),
        },
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete institute user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};