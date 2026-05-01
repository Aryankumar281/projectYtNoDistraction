import bcrypt from "bcrypt";
import prisma from "../config/db";
import { Request, Response } from "express";
import { generateToken } from "../utils/jwt";


export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });
  res.json({ message: "User created" });
};

export const login = async (req:Request, res:Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "User not found" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });
  const token = generateToken(user.id);
  res.json({ token });
};

