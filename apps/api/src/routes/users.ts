import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { FollowingArtistModel } from "../models/Listening.js";
import { toUserProfile, UserModel } from "../models/User.js";
import { asyncHandler, HttpError } from "../utils/http.js";

export const usersRouter = Router();

usersRouter.get(
  "/me/profile",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const [user, followingArtists] = await Promise.all([
      UserModel.findById(req.user!.id),
      FollowingArtistModel.find({ user: req.user!.id })
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    if (!user) throw new HttpError(404, "User not found");
    res.json({
      followingArtists: followingArtists.map((row) => row.artist),
      user: toUserProfile(user),
    });
  }),
);

usersRouter.patch(
  "/me/profile",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = z
      .object({
        avatarUrl: z.string().url().optional().or(z.literal("")),
        displayName: z.string().min(2).max(80).optional(),
        favoriteGenres: z.array(z.string()).optional(),
        theme: z.enum(["spotify", "midnight", "contrast"]).optional(),
      })
      .parse(req.body);

    const user = await UserModel.findByIdAndUpdate(req.user!.id, body, {
      new: true,
    });
    if (!user) throw new HttpError(404, "User not found");
    res.json({ user: toUserProfile(user) });
  }),
);
