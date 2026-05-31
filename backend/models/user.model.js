import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student"
    },

    avatar: {
      type: String,
      default: ""
    },

    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],

    createdCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],

    bio: {
      type: String,
      default: ""
    }
},{timestamps: true});

export const User = mongoose.model("User", userSchema);
