import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    videoUrl: {
        type: String,
        default: ""
    },

    duration: {
        type: Number, // Duration in minutes
        default: 0
    },

    cloudinaryId: {
        type: String,   // ← add this
        default: ""
    },

    order: {
        type: Number,
        default: 0
    },

    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    resources: [
        {
            type: String
        }
    ],

    isFree: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

export const Lesson = mongoose.model("Lesson", lessonSchema);