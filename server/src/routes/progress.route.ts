import express from "express";
import { updateProgress, getProgress, markAsComplete } from "../controllers/progress.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authMiddleware);

router.post("/update", updateProgress);
router.get("/:videoId", getProgress);
router.post("/complete", markAsComplete);

export default router;
