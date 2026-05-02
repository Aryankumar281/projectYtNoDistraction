import { Request, Response } from "express";
import prisma from "../config/db";
import { parseTimeToSeconds } from "../utils/time";

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { videoId, currentTime, duration } = req.body;

    if (!videoId || currentTime === undefined || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const currentSeconds = parseTimeToSeconds(currentTime);
    const totalDurationSeconds = parseTimeToSeconds(duration);

    // 1. Check if progress already exists
    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    // 1b. Update video duration if missing (since we have it from client now)
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (video && !video.duration && totalDurationSeconds > 0) {
      await prisma.video.update({
        where: { id: videoId },
        data: { duration: Math.floor(totalDurationSeconds) }
      });
    }

    // 2. Calculate new watched time (never decrease)
    const newWatchedTime = existingProgress 
      ? Math.max(existingProgress.watchedTime, currentSeconds) 
      : currentSeconds;

    // 3. Auto-mark complete if >= 90%
    const isCompleted = newWatchedTime >= totalDurationSeconds * 0.9;

    // 4. Upsert progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        watchedTime: newWatchedTime,
        completed: isCompleted || (existingProgress?.completed ?? false),
      },
      create: {
        userId,
        videoId,
        watchedTime: newWatchedTime,
        completed: isCompleted,
      },
    });

    res.json(progress);
  } catch (error: any) {
    console.error("Update Progress Error:", error);
    res.status(500).json({ error: "Failed to update progress", details: error.message });
  }
};

export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const videoId = req.params.videoId as string;

    const progress = await prisma.progress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (!progress) {
      return res.json({ watchedTime: 0, completed: false });
    }

    res.json(progress);
  } catch (error: any) {
    console.error("Get Progress Error:", error);
    res.status(500).json({ error: "Failed to fetch progress", details: error.message });
  }
};

export const markAsComplete = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: "Video ID is required" });
    }

    const video = await prisma.video.findUnique({
        where: {id: videoId}
    })

    if(!video){
        return res.status(404).json({error: "Video not found"})
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        completed: true,
        watchedTime: video.duration ? video.duration : 0,
      },
      create: {
        userId,
        videoId,
        watchedTime: video.duration ? video.duration : 0, 
        completed: true,
      },
    });

    res.json(progress);
  } catch (error: any) {
    console.error("Mark Complete Error:", error);
    res.status(500).json({ error: "Failed to mark as complete", details: error.message });
  }
};
