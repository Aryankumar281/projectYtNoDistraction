import express, { Request, Response } from "express";

import cors from "cors";
import authRoutes from "./routes/auth.route";
import playlistsRoutes from "./routes/playlist.route";
import videoRoutes from "./routes/video.route";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/playlist", playlistsRoutes);
app.use("/api/video", videoRoutes);

app.get("/", (req:Request, res:Response) => {
  res.send("API is running....");
});

export default app;