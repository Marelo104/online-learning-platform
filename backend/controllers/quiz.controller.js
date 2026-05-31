import { Quiz } from "../models/quiz.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";

// instructor creates a quiz for a course or lesson
export const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions, passingScore, timeLimit, lessonId } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Title and questions are required" });
    }

    // check course exists and instructor owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const quiz = await Quiz.create({
      course: courseId,
      lesson: lessonId || null,
      title,
      questions,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 0,
    });

    return res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.log("Error in createQuiz:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get quiz for a course — hide correct answers from students
export const getQuizByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "No quiz found for this course" });
    }

    const course = await Course.findById(courseId);

    // check if instructor — compare as strings
    const isInstructor =
      course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    // instructor and admin see full quiz with answers
    if (isInstructor || isAdmin) {
      return res.status(200).json({ success: true, quiz });
    }

    // check enrollment for students
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      paymentStatus: "completed",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled to attempt this quiz",
      });
    }

    // hide correct answers from students
    const quizForStudent = {
      _id: quiz._id,
      title: quiz.title,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
      })),
    };

    return res.status(200).json({ success: true, quiz: quizForStudent });
  } catch (error) {
    console.log("Error in getQuizByCourse:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// student submits quiz answers — calculate score
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const course = await Course.findById(quiz.course);
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    // check enrollment — skip for instructor and admin
    if (!isInstructor && !isAdmin) {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: quiz.course,
        paymentStatus: "completed",
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled to attempt this quiz",
        });
      }
    }

    // calculate score
    let correctCount = 0;
    const results = quiz.questions.map((question) => {
      const studentAnswer = answers.find(
        (a) => a.questionId === question._id.toString()
      );

      const isCorrect =
        studentAnswer !== undefined &&
        studentAnswer.selectedAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      return {
        questionId: question._id,
        questionText: question.questionText,
        selectedAnswer: studentAnswer?.selectedAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        isCorrect,
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    return res.status(200).json({
      success: true,
      result: {
        score,
        passed,
        correctCount,
        totalQuestions: quiz.questions.length,
        passingScore: quiz.passingScore,
        results,
      },
    });
  } catch (error) {
    console.log("Error in submitQuiz:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// update quiz — instructor only
export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // check ownership
    const course = await Course.findById(quiz.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { ...req.body },
      { returnDocument: "after" }
    );

    return res.status(200).json({ success: true, quiz: updatedQuiz });
  } catch (error) {
    console.log("Error in updateQuiz:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// delete quiz — instructor only
export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const course = await Course.findById(quiz.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Quiz.findByIdAndDelete(quizId);

    return res.status(200).json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    console.log("Error in deleteQuiz:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};