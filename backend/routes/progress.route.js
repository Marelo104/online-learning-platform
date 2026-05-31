import { Router } from "express";
import {
  markLessonComplete,
  markLessonIncomplete,
  getCourseProgress,
  getAllProgress,
} from "../controllers/progress.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/progress/all", protectRoute, getAllProgress);
router.get("/:courseId/progress", protectRoute, getCourseProgress);
router.post("/:courseId/lessons/:lessonId/complete", protectRoute, markLessonComplete);
router.delete("/:courseId/lessons/:lessonId/complete", protectRoute, markLessonIncomplete);

export default router;