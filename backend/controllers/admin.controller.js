import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Payment } from "../models/payment.model.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";
import { Lesson } from "../models/lesson.model.js";

// get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // run all queries at the same time using Promise.all
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalInstructors,
      totalStudents,
      payments,
      recentEnrollments,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments({ paymentStatus: "completed" }),
      User.countDocuments({ role: "instructor" }),
      User.countDocuments({ role: "student" }),
      Payment.find({ status: "completed" }),
      Enrollment.find({ paymentStatus: "completed" })
        .populate("student", "name email avatar")
        .populate("course", "title thumbnail price")
        .sort({ createdAt: -1 })
        .limit(5),
      User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // calculate total revenue from all completed payments
    const totalRevenue = payments.reduce((acc, payment) => acc + payment.amount, 0);

    // monthly revenue for chart — group by month
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // top courses by enrollment
    const topCourses = await Course.find()
      .populate("instructor", "name")
      .sort({ enrolledStudents: -1 })
      .limit(5)
      .select("title thumbnail price enrolledStudents rating");

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalInstructors,
        totalStudents,
        totalRevenue,
      },
      monthlyRevenue,
      topCourses,
      recentEnrollments,
      recentUsers,
    });
  } catch (error) {
    console.log("Error in getDashboardStats:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("Error in getAllUsers:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get single user with their enrollments and courses
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("enrolledCourses", "title thumbnail price category level")
      .populate("createdCourses", "title thumbnail price isPublished enrolledStudents");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // get enrollment details with progress
    const enrollments = await Enrollment.find({ student: req.params.userId })
      .populate("course", "title thumbnail price")
      .sort({ createdAt: -1 });

    // get payment history
    const payments = await Payment.find({ student: req.params.userId })
      .populate("course", "title price")
      .sort({ createdAt: -1 });

    // calculate stats
    const totalSpent = payments
      .filter((p) => p.status === "completed")
      .reduce((acc, p) => acc + p.amount, 0);

    const completedCourses = enrollments.filter((e) => e.isCompleted).length;

    return res.status(200).json({
      success: true,
      user,
      enrollments,
      payments,
      stats: {
        totalEnrollments: enrollments.length,
        completedCourses,
        totalSpent,
        totalCoursesCreated: user.createdCourses?.length || 0,
      },
    });
  } catch (error) {
    console.log("Error in getUserById:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// toggle user role between student and instructor
export const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // admin role cannot be changed through this endpoint
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot change admin role" });
    }

    // toggle between student and instructor
    const newRole = user.role === "student" ? "instructor" : "student";
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { role: newRole },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: `User role changed to ${newRole}`,
      user: updatedUser
    });
  } catch (error) {
    console.log("Error in toggleUserRole:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// delete user and all their data
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // cannot delete another admin
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot delete admin account" });
    }

    // delete all their enrollments
    await Enrollment.deleteMany({ student: req.params.userId });

    // delete all their payments
    await Payment.deleteMany({ student: req.params.userId });

    // delete user
    await User.findByIdAndDelete(req.params.userId);

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log("Error in deleteUser:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all courses — admin sees everything including unpublished
export const getAllCourses = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const courses = await Course.find(filter)
      .populate("instructor", "name email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.log("Error in getAllCourses:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// admin deletes any course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // delete thumbnail from Cloudinary
    if (course.thumbnailPublicId) {
      await deleteFromCloudinary(course.thumbnailPublicId, "image");
    }

    // get all lessons to delete their videos
    const lessons = await Lesson.find({ course: req.params.courseId });

    // delete all lesson videos from Cloudinary
    await Promise.all(
      lessons
        .filter((lesson) => lesson.cloudinaryId)
        .map((lesson) => deleteFromCloudinary(lesson.cloudinaryId, "video"))
    );

    // delete all lessons
    await Lesson.deleteMany({ course: req.params.courseId });

    // delete all enrollments for this course
    await Enrollment.deleteMany({ course: req.params.courseId });

    // remove course from instructor's createdCourses
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { createdCourses: req.params.courseId },
    });

    // remove course from all students' enrolledCourses
    await User.updateMany(
      { enrolledCourses: req.params.courseId },
      { $pull: { enrolledCourses: req.params.courseId } }
    );

    // finally delete the course
    await Course.findByIdAndDelete(req.params.courseId);

    return res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.log("Error in deleteCourse:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("student", "name email avatar")
      .populate("course", "title thumbnail price")
      .sort({ createdAt: -1 });

    // total revenue
    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((acc, p) => acc + p.amount, 0);

    return res.status(200).json({ success: true, payments, totalRevenue });
  } catch (error) {
    console.log("Error in getAllPayments:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};