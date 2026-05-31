import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  deleteCourse,
  updateCourse,
  publishCourse,
  getInstructorCourses,
} from "../controllers/course.controller.js";
import { protectRoute, instructorOnly } from "../middleware/auth.middleware.js";
import { uploadThumbnail, handleUpload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", getAllCourses);
router.get("/instructor/my-courses", protectRoute, instructorOnly, getInstructorCourses);
router.get("/:id", getCourseById);

router.post(
  "/",
  protectRoute,
  instructorOnly,
  handleUpload(uploadThumbnail),
  createCourse
);

router.put(
  "/:id",
  protectRoute,
  instructorOnly,
  handleUpload(uploadThumbnail),
  updateCourse
);

router.delete("/:id", protectRoute, instructorOnly, deleteCourse);
router.patch("/:id/publish", protectRoute, instructorOnly, publishCourse);

export default router;