import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
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

    amount: {
        type: Number,
        required: true
    },

    currency: {
        type: String,
        default: "USD"
    },

    status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending"
    },

    stripeSessionId: {
        type: String,
        default: ""
    },

    stripePaymentIntentId: {
        type: String,
        default: ""
    },

    paidAt: {
        type: Date
    }
},{timestamps: true});

export const Payment = mongoose.model("Payment", paymentSchema);