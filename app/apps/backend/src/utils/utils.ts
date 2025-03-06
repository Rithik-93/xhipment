import { Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@repo/database/client";
import { config } from "dotenv";
import { JWT_SECRET } from "../config/config";

config();

export function generateRandomString(length = 10) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

export const generateTokens = (userId: string) => {
  if (!userId) {
    throw new Error("userId not provided");
  }
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const sendAuthTokens = (res: Response, userId: string) => {
  const { accessToken, refreshToken } = generateTokens(userId);
  setRefreshTokenCookie(res, refreshToken);
  return { accessToken, refreshToken };
};
