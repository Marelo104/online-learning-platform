import express from "express";
import dotenv from "dotenv"
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import courseRoutes from "./routes/course.route.js";
import lessonRoutes from "./routes/lesson.route.js";
import enrollmentRoutes from "./routes/enrollment.route.js";
import quizRoutes from "./routes/quiz.route.js";
import progressRoutes from "./routes/progress.route.js";
import paymentRoutes from "./routes/payment.route.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// raw body for stripe webhook — MUST be before express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Online Learning Platform API!");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/courses", lessonRoutes); // nested under courses for context
app.use("/api/enrollments", enrollmentRoutes);
app.use('/api/courses', quizRoutes); // quizzes are also nested under courses
app.use('/api/courses', progressRoutes); 
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));

  app.use((req, res) => {
    res.sendFile(
      path.resolve(__dirname, "frontend/dist/index.html")
    );
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
