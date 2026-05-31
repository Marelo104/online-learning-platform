import { Router } from "express";
import { signup, login, logout, getMe, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js"
import { uploadAvatar, handleUpload } from "../middleware/upload.middleware.js";

const router = Router()

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout)
router.get('/me', protectRoute, getMe);
router.put(
  "/profile",
  protectRoute,
  handleUpload(uploadAvatar),
  updateProfile
);

export default router