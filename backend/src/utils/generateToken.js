import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      instituteId: user.instituteId || null,
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
};