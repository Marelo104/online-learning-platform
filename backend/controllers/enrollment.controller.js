import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

// enroll in a free course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // check course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // only free courses can be enrolled directly
    // paid courses must go through payment
    if (course.price > 0) {
      return res.status(400).json({
        success: false,
        message: "This is a paid course. Please complete payment to enroll",
      });
    }

    // check if already enrolled — compound index prevents duplicates
    // but we check manually to give a better error message
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    // create enrollment — run all three DB operations at the same time
    // Promise.all is faster than running them one after another
    const [enrollment] = await Promise.all([
      // 1. create the enrollment document
      Enrollment.create({
        student: studentId,
        course: courseId,
        paymentStatus: "completed",  // free course so instantly completed
        amountPaid: 0,
      }),

      // 2. add course to student's enrolledCourses array
      User.findByIdAndUpdate(studentId, {
        $addToSet: { enrolledCourses: courseId }, // addToSet prevents duplicates
      }),

      // 3. add student to course's enrolledStudents array
      Course.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledStudents: studentId },
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.log("Error in enrollInCourse:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all courses the logged in student is enrolled in
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: "course",
        populate: {
          path: "instructor",   // nested populate — get instructor inside course
          select: "name avatar",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, enrollments });
  } catch (error) {
    console.log("Error in getMyEnrollments:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// check if student is enrolled in a specific course
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    // return simple boolean — frontend uses this to show enroll button or not
    return res.status(200).json({
      success: true,
      isEnrolled: !!enrollment,           // !! converts to boolean
      enrollment: enrollment || null,
    });
  } catch (error) {
    console.log("Error in getEnrollmentStatus:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// unenroll from a free course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    // cannot unenroll from a paid course — they paid for it
    if (enrollment.amountPaid > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot unenroll from a paid course. Contact support for refunds",
      });
    }

    // remove enrollment and update both arrays at the same time
    await Promise.all([
      // 1. delete the enrollment document
      Enrollment.findByIdAndDelete(enrollment._id),

      // 2. remove course from student's enrolledCourses
      User.findByIdAndUpdate(studentId, {
        $pull: { enrolledCourses: courseId },
      }),

      // 3. remove student from course's enrolledStudents
      Course.findByIdAndUpdate(courseId, {
        $pull: { enrolledStudents: studentId },
      }),
    ]);

    return res.status(200).json({ success: true, message: "Unenrolled successfully" });
  } catch (error) {
    console.log("Error in unenrollFromCourse:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};