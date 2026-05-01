import express from "express";
import { importPlaylist, addVideosToPlaylist } from "../controllers/video.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authMiddleware);

router.post("/import", importPlaylist);
router.post("/add-to-playlist", addVideosToPlaylist);
export default router;