import prisma from "../config/db";
import { Request, Response } from "express";


export const createPlaylist = async (req: Request, res: Response) => {
    const {title} = req.body;
    const userId = (req as any).user.userId;
    const existing = await prisma.playlist.findFirst({
      where: {
        userId,
        title
      }
    });
    
    if (existing) {
      return res.status(400).json({
        error: "Playlist already exists"
      });
    }
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


export const deletePlaylist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.userId;

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: String(id) }
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (playlist.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this playlist" });
    }

    await prisma.playlist.delete({
      where: { id: String(id) }
    });

    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Delete playlist error:", error);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
};

