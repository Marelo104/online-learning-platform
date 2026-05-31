import { Router } from "express";
import {
  createCheckoutSession,
  stripeWebhook,
  verifyPayment,
  getMyPayments,
} from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

// webhook must be first and has no auth — Stripe calls this directly
// also needs raw body — handled in server.js
router.post("/webhook", stripeWebhook);

// create checkout session — student must be logged in
router.post("/:courseId/checkout", protectRoute, createCheckoutSession);

// verify payment on success page
router.get("/verify/:sessionId", protectRoute, verifyPayment);

// get payment history
router.get("/my-payments", protectRoute, getMyPayments);

export default router;