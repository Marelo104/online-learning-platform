import { Router } from "express";
import {
  addLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller.js";
import { protectRoute, instructorOnly } from "../middleware/auth.middleware.js";
import { uploadVideo, handleUpload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/:courseId/lessons", protectRoute, getLessons);
router.get("/lessons/:id", protectRoute, getLessonById);

// ✅ use multer uploadVideo middleware
router.post(
  "/:courseId/lessons",
  protectRoute,
  instructorOnly,
  handleUpload(uploadVideo),
  addLesson
);

router.put(
  "/lessons/:id",
  protectRoute,
  instructorOnly,
  handleUpload(uploadVideo),
  updateLesson
);

router.delete("/lessons/:id", protectRoute, instructorOnly, deleteLesson);

export default router;