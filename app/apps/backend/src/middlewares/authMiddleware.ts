import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.refreshToken; //should ideally authenticate using accessToken but since there is no frontend I'm using refreshToken
  if (!token) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, 'asdasd') as { id: string };
    req.userId = (decoded as JwtPayload).userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

export default authMiddleware;
