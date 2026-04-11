import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../services/emailService.js";
import { env } from "../config/env.js";

const mapInstituteData = (institute) => {
  if (!institute) return null;

  return {
    id: institute.id,
    name: institute.name,
    subdomain: institute.subdomain,
    plan: institute.plan,
    logoUrl: institute.logoUrl,
    primaryColor: institute.primaryColor,
    secondaryColor: institute.secondaryColor,
    status: institute.status,
    storageLimitMb: institute.storageLimitMb,
  };
};

export const signupUser = async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      password,
      instituteName,
      subdomain,
      plan,
      primaryColor,
      secondaryColor,
      logoUrl,
    } = req.body;

    if (!role || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Role, name, email and password are required.",
      });
    }

    const normalizedRole = role.trim().toUpperCase();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const allowedRoles = ["INSTITUTE_ADMIN", "TEACHER", "STUDENT"];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);

    let createdUser;
    let instituteData = null;

    if (normalizedRole === "INSTITUTE_ADMIN") {
      if (!instituteName || !subdomain) {
        return res.status(400).json({
          success: false,
          message: "Institute name and subdomain are required for institute admin signup.",
        });
      }

      const normalizedInstituteName = instituteName.trim();
      const normalizedSubdomain = subdomain.trim().toLowerCase();

      const validPlans = ["STARTER", "PROFESSIONAL", "ENTERPRISE"];
      const selectedPlan =
        plan && validPlans.includes(plan.trim().toUpperCase())
          ? plan.trim().toUpperCase()
          : "STARTER";

      const existingInstitute = await prisma.institute.findUnique({
        where: { subdomain: normalizedSubdomain },
      });

      if (existingInstitute) {
        return res.status(409).json({
          success: false,
          message: "Subdomain already exists.",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const institute = await tx.institute.create({
          data: {
            name: normalizedInstituteName,
            subdomain: normalizedSubdomain,
            plan: selectedPlan,
            primaryColor: primaryColor || null,
            secondaryColor: secondaryColor || null,
            logoUrl: logoUrl || null,
          },
        });

        const user = await tx.user.create({
          data: {
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: "INSTITUTE_ADMIN",
            instituteId: institute.id,
            isEmailVerified: false,
            emailVerifyToken,
            emailVerifyTokenExpiry,
          },
        });

        return { institute, user };
      });

      createdUser = result.user;
      instituteData = result.institute;
    } else {
      if (!subdomain) {
        return res.status(400).json({
          success: false,
          message: "Institute subdomain is required for teacher/student signup.",
        });
      }

      const normalizedSubdomain = subdomain.trim().toLowerCase();

      const institute = await prisma.institute.findUnique({
        where: { subdomain: normalizedSubdomain },
      });

      if (!institute) {
        return res.status(404).json({
          success: false,
          message: "Institute not found for the given subdomain.",
        });
      }

      const user = await prisma.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          password: hashedPassword,
          role: normalizedRole,
          instituteId: institute.id,
          isEmailVerified: false,
          emailVerifyToken,
          emailVerifyTokenExpiry,
        },
      });

      createdUser = user;
      instituteData = institute;
    }

    const verifyUrl = `${env.frontendUrl}/verify-email?token=${emailVerifyToken}`;

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Verify your email - B2World LMS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #111827;">B2World LMS</h1>
            <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Email Verification</p>
          </div>

          <p style="font-size: 16px; color: #111827;">Hello ${normalizedName},</p>

          <p style="font-size: 15px; color: #374151; line-height: 1.6;">
            Welcome to <strong>B2World LMS</strong>. Please verify your email address to activate your account.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a
              href="${verifyUrl}"
              style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; font-size: 14px;"
            >
              Verify Email
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            This link will expire in <strong>1 hour</strong>.
          </p>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            If the button does not work, copy and paste this link into your browser:
          </p>

          <p style="word-break: break-all; font-size: 13px; color: #2563eb;">
            ${verifyUrl}
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
            If you did not create this account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful. Please check your email to verify your account before logging in.",
      data: {
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          instituteId: createdUser.instituteId,
          isEmailVerified: createdUser.isEmailVerified,
        },
        institute: mapInstituteData(instituteData),
      },
      devInfo:
        process.env.NODE_ENV !== "production"
          ? {
              verificationToken: emailVerifyToken,
              verificationUrl: verifyUrl,
              emailSkipped: emailResult?.skipped || false,
            }
          : undefined,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error while signing up.",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token.",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error while verifying email.",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        institute: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

   

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          instituteId: user.instituteId,
          isEmailVerified: user.isEmailVerified,
        },
        institute: mapInstituteData(user.institute),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error while logging in.",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    const passwordResetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetTokenExpiry,
      },
    });

    const resetUrl = `${env.frontendUrl}/reset-password?token=${passwordResetToken}`;

    const emailResult = await sendEmail({
      to: user.email,
      subject: "Reset your password - B2World LMS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #111827;">B2World LMS</h1>
            <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Password Reset</p>
          </div>

          <p style="font-size: 16px; color: #111827;">Hello ${user.name},</p>

          <p style="font-size: 15px; color: #374151; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a
              href="${resetUrl}"
              style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; font-size: 14px;"
            >
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            This link will expire in <strong>1 hour</strong>.
          </p>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            If the button does not work, copy and paste this link into your browser:
          </p>

          <p style="word-break: break-all; font-size: 13px; color: #2563eb;">
            ${resetUrl}
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
      devInfo:
        process.env.NODE_ENV !== "production"
          ? {
              resetToken: passwordResetToken,
              resetUrl,
              emailSkipped: emailResult?.skipped || false,
            }
          : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error while processing forgot password request.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error while resetting password.",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const currentUserId = req.user?.userId || req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        institute: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          instituteId: user.instituteId,
          isEmailVerified: user.isEmailVerified,
        },
        institute: mapInstituteData(user.institute),
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error while fetching profile.",
    });
  }
};