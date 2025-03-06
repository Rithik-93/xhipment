import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { userCreateSchema, userLoginSchema } from "../schema/types";
import prisma from "@repo/database/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  findUserByEmail,
  generateTokens,
  hashPassword,
  sendAuthTokens,
  setRefreshTokenCookie,
} from "../utils/utils";
import { JWT_SECRET_REFRESH_TOKEN } from "../config/config";

const register = async (req: Request, res: Response) => {
  try {
    const data = userCreateSchema.safeParse(req.body);
    if (!data.success) {
      res.status(400).json({ status: "fail", errors: data.error.format() });
      return;
    }

    const { email, password } = data.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ status: "fail", message: "Email already in use" });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
      },
    });

    const { accessToken } = sendAuthTokens(res, user.id);

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      accessToken,
      user,
    });
    return;
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    res
      .status(500)
      .json({ status: "error", message: "An unexpected error occurred" });
    return;
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const data = userLoginSchema.safeParse(req.body);
    if (!data.success) {
      res.status(400).json({ status: "fail", errors: data.error.format() });
      return;
    }

    const { email, password } = data.data;

    const user = await findUserByEmail(email);
    if (!user) {
      res
        .status(401)
        .json({ status: "fail", message: "Incorrect email or password" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res
        .status(401)
        .json({ status: "fail", message: "Incorrect email or password" });
      return;
    }

    const { accessToken, refreshToken } = sendAuthTokens(res, user.id);

    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        refreshToken,
      },
    });

    res.json({
      status: "success",
      message: "Login successful",
      accessToken,
    });
    return;
  } catch (error) {
    console.error("Unexpected error during login:", error);
    res
      .status(500)
      .json({ status: "error", message: "An unexpected error occurred" });
    return;
  }
};

const logout = (req: Request, res: Response) => {
  res
    .cookie("refreshToken", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({
      status: "success",
      message: "Successfully logged out",
    });
  return;
};

const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res
      .status(401)
      .json({ status: "fail", message: "No refresh token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      JWT_SECRET_REFRESH_TOKEN
    ) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ status: "fail", message: "User not found" });
      return;
    }

    if (user.refreshToken !== refreshToken) {
      res
        .status(403)
        .json({ status: "fail", message: "Invalid refresh token" });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({ status: "success", accessToken });
    return;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Refresh token error:", error.message);
    } else {
      console.error("Refresh token error:", error);
    }
    res
      .status(403)
      .json({ status: "fail", message: "Invalid or expired refresh token" });
    return;
  }
};

export { register, login, logout, refreshAccessToken };
