import prisma from "../config/db";
import { Request, Response } from "express";


export const createPlaylist = async (req: Request, res: Response) => {
    const {title} = req.body;
    const userId = (req as any).user.userId;

    const playlist = await prisma.playlist.create({
        data:{
            title,
            userId,
            source:"custom"
        }
    })
    return res.json(playlist);
};

export const getPlaylists = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  const playlists = await prisma.playlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  res.json(playlists);
};


export const getPlaylistById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const playlist = await prisma.playlist.findUnique({
    where: { id: String(id) },
    include: {
      videos: {
        orderBy: { order: "asc" }
      }
    }
  });

  res.json(playlist);
};

