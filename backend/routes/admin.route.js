import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  toggleUserRole,
  deleteUser,
  getAllCourses,
  deleteCourse,
  getAllPayments,
} from "../controllers/admin.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

// all admin routes are protected by both protectRoute and adminOnly
router.get("/stats", protectRoute, adminOnly, getDashboardStats);

// user management
router.get("/users", protectRoute, adminOnly, getAllUsers);
router.get("/users/:userId", protectRoute, adminOnly, getUserById);
router.patch("/users/:userId/role", protectRoute, adminOnly, toggleUserRole);
router.delete("/users/:userId", protectRoute, adminOnly, deleteUser);

// course management
router.get("/courses", protectRoute, adminOnly, getAllCourses);
router.delete("/courses/:courseId", protectRoute, adminOnly, deleteCourse);

// payment management
router.get("/payments", protectRoute, adminOnly, getAllPayments);

export default router;