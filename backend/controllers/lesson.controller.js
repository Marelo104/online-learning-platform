import { Lesson } from "../models/lesson.model.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";


export const addLesson = async (req, res) => {
  try {
    const { title, description, order, isFree, duration } = req.body;
    const { courseId } = req.params;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    let videoUrl = "";
    let cloudinaryId = "";

    // multer puts single file on req.file ✅
    if (req.file) {
      const { url, publicId } = await uploadToCloudinary(
        req.file.path,        // ✅ multer uses req.file.path
        "learnify/videos",
        "video"
      );
      videoUrl = url;
      cloudinaryId = publicId;
    }

    console.log(videoUrl);
    console.log(cloudinaryId);

    const lesson = await Lesson.create({
      title,
      description: description || "",
      videoUrl,
      cloudinaryId,
      duration: Number(duration) || 0,
      order: Number(order) || course.lessons.length + 1,
      isFree: isFree === "true" || isFree === true,
      course: courseId,
    });

    console.log("Created lesson:", lesson);

    await Course.findByIdAndUpdate(courseId, {
      $push: { lessons: lesson._id },
    });

    return res.status(201).json({ success: true, lesson });
  } catch (error) {
    console.log("Error in addLesson:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    // if user is not logged in or not enrolled — hide videoUrl for paid lessons
    let processedLessons = lessons.map((lesson) => {
      const lessonObj = lesson.toObject();
      if (!lesson.isFree) {
        lessonObj.videoUrl = "";  // hide video URL for non-free lessons
      }
      return lessonObj;
    });

    // if user is logged in check if they are enrolled or the instructor
    if (req.user) {
      const isInstructor = course.instructor.toString() === req.user._id.toString();
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
        paymentStatus: "completed",
      });

      if (isInstructor || enrollment || req.user.role === "admin") {
        // show all video URLs
        processedLessons = lessons.map((lesson) => lesson.toObject());
      }
    }

    return res.status(200).json({ success: true, lessons: processedLessons });
  } catch (error) {
    console.log("Error in getLessons:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const course = await Course.findById(lesson.course);

    // free lesson — anyone can watch
    if (lesson.isFree) {
      return res.status(200).json({ success: true, lesson });
    }

    // paid lesson — check enrollment or instructor
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course,
      paymentStatus: "completed",
    });

    if (!isInstructor && !enrollment && req.user.role !== "admin") {
      // return lesson without videoUrl
      const lessonObj = lesson.toObject();
      lessonObj.videoUrl = "";
      return res.status(200).json({
        success: false,
        message: "Enroll in this course to watch this lesson",
        lesson: lessonObj,
      });
    }

    return res.status(200).json({ success: true, lesson });
  } catch (error) {
    console.log("Error in getLessonById:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // check course ownership
    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // if new video uploaded replace the old one
    if (req.files?.video) {
      // delete old video from Cloudinary
      if (lesson.cloudinaryId) {
        await deleteFromCloudinary(lesson.cloudinaryId, "video");
      }

      // upload new video
      const { url, publicId } = await uploadToCloudinary(
        req.files.video.tempFilePath,
        "learnify/videos",
        "video"
      );

      req.body.videoUrl = url;
      req.body.cloudinaryId = publicId;
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { returnDocument: "after" }
    );

    return res.status(200).json({ success: true, lesson: updatedLesson });
  } catch (error) {
    console.log("Error in updateLesson:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // check course ownership
    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // delete video from Cloudinary
    if (lesson.cloudinaryId) {
      await deleteFromCloudinary(lesson.cloudinaryId, "video");
    }

    await Lesson.findByIdAndDelete(req.params.id);

    // remove lesson from course's lessons array
    await Course.findByIdAndUpdate(lesson.course, {
      $pull: { lessons: req.params.id },
    });

    return res.status(200).json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.log("Error in deleteLesson:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};