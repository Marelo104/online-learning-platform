import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    },

    title: {
        type: String,
        required: true
    },
    
    questions: [
        {
            questionText: {
                type: String,
                required: true
            },
            options: [
                {
                    type: String,
                    required: true
                }
            ],
            correctAnswer: {
                type: Number,
                required: true
            },
            explanation: {
                type: String,
                default: ""
            }
        }
    ],

    passingScore: {
        type: Number,
        default: 70
    },

    timeLimit: {
        type: Number, // Time limit in minutes
        default: 0
    }
},{timestamps: true});

export const Quiz = mongoose.model("Quiz", quizSchema);