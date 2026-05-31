import { Router } from "express";
import { 
    enrollInCourse, 
    getMyEnrollments, 
    getEnrollmentStatus, 
    unenrollFromCourse 
} from "../controllers/enrollment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/:courseId/enroll", protectRoute, enrollInCourse);
router.get("/my-enrollments", protectRoute, getMyEnrollments);
router.get("/:courseId/status", protectRoute, getEnrollmentStatus);
router.delete("/:courseId/unenroll", protectRoute, unenrollFromCourse);

export default router;