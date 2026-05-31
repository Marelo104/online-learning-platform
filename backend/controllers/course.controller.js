import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const {
      title, description, price, category,
      level, requirements, whatYouWillLearn,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    let thumbnailUrl = "";
    let thumbnailPublicId = "";

    // multer single file is on req.file ✅
    if (req.file) {
      const { url, publicId } = await uploadToCloudinary(
        req.file.path,
        "learnify/thumbnails",
        "image"
      );
      thumbnailUrl = url;
      thumbnailPublicId = publicId;
    }

    const course = await Course.create({
      title,
      description,
      price: Number(price) || 0,
      category: category || "other",
      level: level || "beginner",
      thumbnail: thumbnailUrl,
      thumbnailPublicId,
      instructor: req.user._id,
      requirements: requirements
        ? Array.isArray(requirements) ? requirements : requirements.split(",").map(r => r.trim())
        : [],
      whatYouWillLearn: whatYouWillLearn
        ? Array.isArray(whatYouWillLearn) ? whatYouWillLearn : whatYouWillLearn.split(",").map(w => w.trim())
        : [],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id },
    });

    return res.status(201).json({ success: true, course });
  } catch (error) {
    console.log("Error in createCourse:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const { search, category, level, minPrice, maxPrice } = req.query;

    const filter = { isPublished: true };

    // search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;
    if (level) filter.level = level;

    // price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const courses = await Course.find(filter)
      .populate("instructor", "name avatar bio")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.log("Error in getAllCourses:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name avatar bio")
      .populate("lessons");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({ success: true, course });
  } catch (error) {
    console.log("Error in getCourseById:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // ownership check
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // update thumbnail if new one uploaded
    if (req.files?.thumbnail) {
      const { url, publicId } = await uploadToCloudinary(
        req.files.thumbnail.tempFilePath,
        "learnify/thumbnails",
        "image"
      );
      req.body.thumbnail = url;
      req.body.thumbnailPublicId = publicId;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { returnDocument: "after" }
    );

    return res.status(200).json({ success: true, course: updatedCourse });
  } catch (error) {
    console.log("Error in updateCourse:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // ownership check
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // delete thumbnail from Cloudinary
    if (course.thumbnailPublicId) {
        await deleteFromCloudinary(course.thumbnailPublicId, "image");
    }

    await Course.findByIdAndDelete(req.params.id);

    // remove from instructor's createdCourses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdCourses: req.params.id },
    });

    return res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.log("Error in deleteCourse:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // ownership check
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // toggle publish status
    course.isPublished = !course.isPublished;
    await course.save();

    return res.status(200).json({
      success: true,
      message: course.isPublished ? "Course published" : "Course unpublished",
      course,
    });
  } catch (error) {
    console.log("Error in publishCourse:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    // get logged in instructor's own courses — both published and unpublished
    const courses = await Course.find({ instructor: req.user._id })
      .populate("lessons")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.log("Error in getInstructorCourses:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};