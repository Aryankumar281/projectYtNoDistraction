import axios from "axios";

const API_KEY = process.env.YOUTUBE_API_KEY;

export const fetchPlaylistVideos = async (playlistId: string) => {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems`;

  const res = await axios.get(url, {
    params: {
      part: "snippet",
      maxResults: 50,
      playlistId,
      key: API_KEY
    }
  });

  return res.data.items.map((item: any, index: number) => ({
    youtubeId: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    source: "youtube",
    order: index
  }));
};

export const fetchVideoDetails = async (videoId: string) => {
  const url = `https://www.googleapis.com/youtube/v3/videos`;

  const res = await axios.get(url, {
    params: {
      part: "snippet,contentDetails",
      id: videoId,
      key: API_KEY
    }
  });

  const item = res.data.items[0];
  if (!item) throw new Error("Video not found");

  return {
    youtubeId: item.id,
    title: item.snippet.title,
    source: "youtube"
  };
};

