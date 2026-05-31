import Stripe from "stripe";
import { Payment } from "../models/payment.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// create stripe checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("instructor", "name");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      paymentStatus: "completed",
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    // free course — no payment needed
    if (course.price === 0) {
      return res.status(400).json({
        success: false,
        message: "This is a free course. Use the enroll endpoint instead",
      });
    }

    // create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      // what the student is buying
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description,
              images: course.thumbnail ? [course.thumbnail] : [],
            },
            // stripe uses cents — multiply by 100
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
      // where to redirect after payment
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/courses/${courseId}?payment=cancelled`,
      // pass metadata so we know what to enroll after payment
      metadata: {
        courseId: courseId.toString(),
        studentId: req.user._id.toString(),
      },
    });

    // create a pending payment record in MongoDB
    await Payment.create({
      student: req.user._id,
      course: courseId,
      amount: course.price,
      currency: "usd",
      status: "pending",
      stripeSessionId: session.id,
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,  // redirect student to this URL
    });
  } catch (error) {
    console.log("Error in createCheckoutSession:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// stripe webhook — called automatically by Stripe after payment
// this is where we actually enroll the student after payment succeeds
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // verify webhook came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("Webhook signature failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log("Webhook event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("Session metadata:", session.metadata);
    console.log("Payment status:", session.payment_status);

    // only process if payment was actually successful
    if (session.payment_status !== "paid") {
      return res.status(200).json({ received: true });
    }

    const { courseId, studentId } = session.metadata;

    if (!courseId || !studentId) {
      console.log("Missing metadata");
      return res.status(200).json({ received: true });
    }

    try {
      // update payment to completed
      await Payment.findOneAndUpdate(
        { stripeSessionId: session.id },
        {
          status: "completed",
          stripePaymentIntentId: session.payment_intent,
          paidAt: new Date(),
        },
        { returnDocument: "after" }
      );

      // check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId,
      });

      if (!existingEnrollment) {
        await Promise.all([
          Enrollment.create({
            student: studentId,
            course: courseId,
            paymentStatus: "completed",
            amountPaid: session.amount_total / 100,
          }),
          User.findByIdAndUpdate(studentId, {
            $addToSet: { enrolledCourses: courseId },
          }),
          Course.findByIdAndUpdate(courseId, {
            $addToSet: { enrolledStudents: studentId },
          }),
        ]);

        console.log(`✅ Enrolled student ${studentId} in course ${courseId}`);
      } else {
        console.log("Already enrolled — skipping");
      }
    } catch (err) {
      console.log("Error creating enrollment:", err.message);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: "failed" },
      { returnDocument: "after" }
    );
    console.log("Payment session expired");
  }

  // always return 200 to Stripe
  res.status(200).json({ received: true });
};


// verify payment on success page — frontend calls this
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    const { courseId, studentId } = session.metadata;

    if (!courseId || !studentId) {
      return res.status(400).json({ success: false, message: "Invalid session metadata" });
    }

    // update payment status
    await Payment.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        status: "completed",
        stripePaymentIntentId: session.payment_intent,
        paidAt: new Date(),
      },
      { returnDocument: "after" }
    );

    // check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!existingEnrollment) {
      // create enrollment
      await Promise.all([
        Enrollment.create({
          student: studentId,
          course: courseId,
          paymentStatus: "completed",
          amountPaid: session.amount_total / 100,
        }),
        User.findByIdAndUpdate(studentId, {
          $addToSet: { enrolledCourses: courseId },
        }),
        Course.findByIdAndUpdate(courseId, {
          $addToSet: { enrolledStudents: studentId },
        }),
      ]);
    }

    const payment = await Payment.findOne({ stripeSessionId: sessionId })
      .populate("course", "title thumbnail price")
      .populate("student", "name email");

    return res.status(200).json({
      success: true,
      message: "Payment verified",
      payment,
      courseId, // ✅ send courseId directly for navigation
    });
  } catch (error) {
    console.log("Error in verifyPayment:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get payment history for logged in student
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate("course", "title thumbnail price")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    console.log("Error in getMyPayments:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};