import axios from "axios";

const API_KEY = process.env.YOUTUBE_API_KEY;

interface YouTubePlaylistItem {
  snippet: {
    title: string;
    resourceId: {
      videoId: string;
    };
  };
}

interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
  };
}

interface YouTubeVideoResponse {
  items: YouTubeVideoItem[];
}

export const fetchPlaylistVideos = async (playlistId: string) => {
  let videos: any[] = [];
  let nextPageToken: string | null = null;
  let order = 0;

  while (true) {
    const response: { data: YouTubePlaylistResponse } = await axios.get<YouTubePlaylistResponse>(
      "https://www.googleapis.com/youtube/v3/playlistItems",
      {
        params: {
          part: "snippet",
          maxResults: 50,
          playlistId,
          pageToken: nextPageToken,
          key: API_KEY
        }
      }
    );

    const items = response.data.items;

    for (const item of items) {
      videos.push({
        youtubeId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        order: order++
      });
    }

    nextPageToken = response.data.nextPageToken || null;
    if (!nextPageToken) break;
  }

  return videos;
};

export const fetchVideoDetails = async (videoId: string) => {
  const url = `https://www.googleapis.com/youtube/v3/videos`;

  const response = await axios.get<YouTubeVideoResponse>(url, {
    params: {
      part: "snippet,contentDetails",
      id: videoId,
      key: API_KEY
    }
  });

  const item = response.data.items[0];
  if (!item) throw new Error("Video not found");

  return {
    youtubeId: item.id,
    title: item.snippet.title,
    source: "youtube"
  };
};

