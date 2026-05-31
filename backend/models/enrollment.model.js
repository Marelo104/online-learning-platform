import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },

    amountPaid: {
        type: Number,
        default: 0
    },

    completedLessons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson"
        }
    ],
    
    progress: {
        type: Number,
        default: 0
    },

    isCompleted: {
        type: Boolean,
        default: false
    },

    completedAt: {
        type: Date
    },

    certificateUrl: {
        type: String,
        default: ""
    },
},{timestamps: true});

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);