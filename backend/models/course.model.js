import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    thumbnail: {
        type: String,
        default: ""
    },

    thumbnailPublicId: {
        type: String,
        default: ""
    },

    price: {
        type: Number,
        default: 0
    },

    category: {
        type: String,
        enum: ["web-dev", "mobile-dev", "data-science", "design", "business", "other"],
        default: "other"
    },

    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },

    duration: {
        type: Number, // Duration in hours
        default: 0
    },

    lessons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson"
        }
    ],

    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },

    isPublished: {
        type: Boolean,
        default: false
    },

    requirements: [String],

    whatYouWillLearn: [String]
}, {timestamps: true});

export const Course = mongoose.model("Course", courseSchema)
