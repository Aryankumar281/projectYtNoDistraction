import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = (req:Request, res:Response, next:NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as jwt.JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};