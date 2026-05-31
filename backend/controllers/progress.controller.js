import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";

// mark a lesson as completed
export const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      paymentStatus: "completed",
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    // don't add duplicate — $addToSet handles this
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    // calculate progress percentage
    const course = await Course.findById(courseId);
    const totalLessons = course.lessons.length;

    const progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    enrollment.progress = progress;

    // mark course as completed if 100%
    if (progress === 100) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return res.status(200).json({
      success: true,
      progress,
      isCompleted: enrollment.isCompleted,
      completedLessons: enrollment.completedLessons,
    });
  } catch (error) {
    console.log("Error in markLessonComplete:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// mark a lesson as incomplete — student can undo
export const markLessonIncomplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    // remove lesson from completedLessons
    enrollment.completedLessons = enrollment.completedLessons.filter(
      (id) => id.toString() !== lessonId
    );

    // recalculate progress
    const course = await Course.findById(courseId);
    const totalLessons = course.lessons.length;
    const progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    enrollment.progress = progress;
    enrollment.isCompleted = progress === 100;

    await enrollment.save();

    return res.status(200).json({
      success: true,
      progress,
      completedLessons: enrollment.completedLessons,
    });
  } catch (error) {
    console.log("Error in markLessonIncomplete:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get progress for a specific course
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    }).populate("completedLessons", "title order duration");

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        isEnrolled: false,
        progress: 0,
        completedLessons: [],
      });
    }

    return res.status(200).json({
      success: true,
      isEnrolled: true,
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
      completedAt: enrollment.completedAt,
      completedLessons: enrollment.completedLessons,
      quizPassed: enrollment.quizPassed,
    });
  } catch (error) {
    console.log("Error in getCourseProgress:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all courses progress for the logged in student
export const getAllProgress = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
      paymentStatus: "completed",
    }).populate("course", "title thumbnail lessons");

    const progress = enrollments.map((enrollment) => ({
      course: enrollment.course,
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
      completedLessons: enrollment.completedLessons.length,
      totalLessons: enrollment.course?.lessons?.length || 0,
      completedAt: enrollment.completedAt,
    }));

    return res.status(200).json({ success: true, progress });
  } catch (error) {
    console.log("Error in getAllProgress:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};