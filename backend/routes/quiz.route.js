import { Router } from "express";
import {
  createQuiz,
  getQuizByCourse,
  submitQuiz,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller.js";
import { protectRoute, instructorOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/:courseId/quiz", protectRoute, instructorOnly, createQuiz);
router.get("/:courseId/quiz", protectRoute, getQuizByCourse);
router.post("/quiz/:quizId/submit", protectRoute, submitQuiz);
router.put("/quiz/:quizId", protectRoute, instructorOnly, updateQuiz);
router.delete("/quiz/:quizId", protectRoute, instructorOnly, deleteQuiz);

export default router;