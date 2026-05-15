import { OAuth2Client } from "google-auth-library";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { hashPassword, toUserProfile, UserModel } from "../models/User.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { signToken } from "../utils/jwt.js";

export const authRouter = Router();
const googleClient = env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(env.GOOGLE_CLIENT_ID)
  : null;

const registerSchema = z.object({
  displayName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const existing = await UserModel.findOne({ email: body.email });
    if (existing) throw new HttpError(409, "Email is already registered");

    const user = await UserModel.create({
      displayName: body.displayName,
      email: body.email,
      passwordHash: await hashPassword(body.password),
    });

    res
      .status(201)
      .json({
        token: signToken({ sub: user.id, role: user.role }),
        user: toUserProfile(user),
      });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await UserModel.findOne({ email: body.email });
    if (!user || !(await user.comparePassword(body.password))) {
      throw new HttpError(401, "Invalid email or password");
    }

    res.json({
      token: signToken({ sub: user.id, role: user.role }),
      user: toUserProfile(user),
    });
  }),
);

authRouter.post(
  "/google",
  asyncHandler(async (req, res) => {
    const { credential } = z.object({ credential: z.string() }).parse(req.body);
    if (!googleClient || !env.GOOGLE_CLIENT_ID) {
      throw new HttpError(501, "Google login is not configured");
    }

    const ticket = await googleClient.verifyIdToken({
      audience: env.GOOGLE_CLIENT_ID,
      idToken: credential,
    });
    const payload = ticket.getPayload();
    if (!payload?.email)
      throw new HttpError(401, "Could not verify Google account");

    const user = await UserModel.findOneAndUpdate(
      { email: payload.email },
      {
        $set: {
          avatarUrl: payload.picture,
          displayName: payload.name ?? payload.email.split("@")[0],
          googleId: payload.sub,
        },
        $setOnInsert: { email: payload.email },
      },
      { new: true, upsert: true },
    );

    res.json({
      token: signToken({ sub: user.id, role: user.role }),
      user: toUserProfile(user),
    });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await UserModel.findById(req.user?.id);
    if (!user) throw new HttpError(404, "User not found");
    res.json({ user: toUserProfile(user) });
  }),
);
