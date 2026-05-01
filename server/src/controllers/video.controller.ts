import { Request, Response } from "express";
import prisma from "../config/db";
import { fetchPlaylistVideos, fetchVideoDetails } from "../utils/youtube";

export const importPlaylist = async (req: any, res: any) => {
  try {
    const { playlistUrl, title } = req.body;
    const userId = req.user.userId;

    let playlistId: string | null = playlistUrl;
    try {
      const url = new URL(playlistUrl);
      const listParam = url.searchParams.get("list");
      if (listParam) {
        playlistId = listParam;
      }
    } catch (e) {
      // If it's not a valid URL, we assume the input is the ID itself
      playlistId = playlistUrl;
    }

    if (!playlistId || typeof playlistId !== "string" || playlistId.length < 5) {
      console.log("Invalid Playlist ID derived:", playlistId);
      return res.status(400).json({ 
        error: "Invalid Playlist URL or ID", 
        received: playlistUrl 
      });
    }

    const videos = await fetchPlaylistVideos(playlistId);

    const playlist = await prisma.playlist.create({
      data: {
        title: title || "Imported Playlist",
        source: "youtube",
        userId,
        videos: {
          create: videos,
        },
      },
      include: { videos: true },
    });

    res.json(playlist);
  } catch (error: any) {
    console.error("Import Error:", error);
    res.status(500).json({ error: "Failed to import playlist", details: error.message });
  }
};

export const addVideosToPlaylist = async (req: any, res: any) => {
  try {
    const { playlistUrl, targetPlaylistId } = req.body;
    const userId = req.user.userId;

    // 1. Verify ownership
    const existingPlaylist = await prisma.playlist.findFirst({
      where: { id: targetPlaylistId, userId }
    });
    if (!existingPlaylist) return res.status(404).json({ error: "Playlist not found" });

    // 2. Determine if it's a playlist or a single video
    let playlistId: string | null = null;
    let videoId: string | null = null;

    try {
      const url = new URL(playlistUrl);
      playlistId = url.searchParams.get("list");
      videoId = url.searchParams.get("v");
    } catch (e) {
      playlistId = playlistUrl; // Assume ID if not a URL
    }

    let videosToAdd = [];

    if (playlistId && playlistId.startsWith("PL")) {
      // It's a playlist
      videosToAdd = await fetchPlaylistVideos(playlistId);
    } else if (videoId || (playlistId && !playlistId.startsWith("PL"))) {
      // It's a single video (either via 'v=' or a raw video ID)
      const details = await fetchVideoDetails(videoId || playlistId!);
      videosToAdd = [details];
    }

    if (videosToAdd.length === 0) {
      return res.status(400).json({ error: "No videos found to add" });
    }

    // 3. Get next order
    const lastVideo = await prisma.video.findFirst({
      where: { playlistId: targetPlaylistId },
      orderBy: { order: "desc" }
    });
    const startOrder = lastVideo ? lastVideo.order + 1 : 0;

    // 4. Save
    await prisma.video.createMany({
      data: videosToAdd.map((v: any, index: number) => ({
        ...v,
        playlistId: targetPlaylistId,
        order: startOrder + index
      }))
    });

    res.json({ message: "Import successful", count: videosToAdd.length });
  } catch (error: any) {
    console.error("Add Error:", error);
    res.status(500).json({ error: "Failed to add videos", details: error.message });
  }
};