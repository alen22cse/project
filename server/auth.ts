import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface AuthRequest extends Request {
  user?: User;
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }

  // You would typically fetch the user from database here
  // For now, we'll just add the userId to the request
  req.user = { id: decoded.userId } as User;
  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = { id: decoded.userId } as User;
    }
  }

  next();
};