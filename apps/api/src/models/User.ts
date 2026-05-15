import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    avatarUrl: String,
    displayName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    favoriteGenres: { type: [String], default: [] },
    googleId: { type: String, index: true },
    passwordHash: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    theme: {
      type: String,
      enum: ["spotify", "midnight", "contrast"],
      default: "spotify",
    },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = function comparePassword(
  password: string,
) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export type UserDocument = InstanceType<typeof UserModel> & {
  comparePassword(password: string): Promise<boolean>;
};

export const UserModel = model("User", userSchema);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function toUserProfile(user: any) {
  return {
    id: user.id,
    avatarUrl: user.avatarUrl,
    displayName: user.displayName,
    email: user.email,
    favoriteGenres: user.favoriteGenres,
    role: user.role,
    theme: user.theme,
  };
}
