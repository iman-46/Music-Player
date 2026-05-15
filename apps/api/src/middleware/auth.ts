import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/User.js";
import { HttpError } from "../utils/http.js";
import { verifyToken } from "../utils/jwt.js";

export type AuthedRequest = Request & {
  user?: {
    id: string;
    role: "user" | "admin";
  };
};

export async function requireAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new HttpError(401, "Missing authorization token"));
  }

  try {
    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.sub).select("_id role");
    if (!user) {
      return next(new HttpError(401, "Invalid session"));
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

export function requireAdmin(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== "admin") {
    return next(new HttpError(403, "Admin access required"));
  }
  next();
}
