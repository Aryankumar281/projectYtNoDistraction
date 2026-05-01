import express from "express";
import {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  deletePlaylist
} from "../controllers/playlist.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createPlaylist);
router.get("/", getPlaylists);
router.get("/:id", getPlaylistById);
router.delete("/:id", deletePlaylist);

export default router;