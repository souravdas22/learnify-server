const crypto = require("crypto");
const Razorpay = require("razorpay");
const PaymentModel = require("../module/admin/payment/payment.model");
const { CourseModel } = require("../module/admin/course/model/course.model");
const UserModel = require("../module/admin/auth/model/user.model");
const ProgressModel = require("../module/admin/progress/model/progress.model");

class PaymentApiController {
  // Checkout API
  async checkout(req, res) {
    try {
      const { amount, courseIds, userId } = req.body;

      var instance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RZORPAY_API_SECRECT,
      });

      const options = {
        amount: Number(amount * 100), // Convert amount to paisa
        currency: "INR",
      };

      const order = await instance.orders.create(options);

      await PaymentModel.create({
        razorpay_order_id: order.id,
        amount,
        courseIds,
        userId,
      });

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error("Checkout error:", error.message);
      res.status(500).json({ message: "Checkout failure" });
    }
  }

  // Payment Verification API
  async paymentVerification(req, res) {
    try {
      console.log(req.body);
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RZORPAY_API_SECRECT)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // Update payment details in DB
        const paymentRecord = await PaymentModel.findOneAndUpdate(
          { razorpay_order_id },
          { razorpay_payment_id, razorpay_signature, status: "Paid" },
          { new: true }
        );

        if (!paymentRecord) {
          return res.status(404).json({ message: "Order not found" });
        }

        // Enroll user in all purchased courses
        const { courseIds, userId } = paymentRecord;

        await Promise.all(
          courseIds.map(async (courseId) => {
            const course = await CourseModel.findById(courseId);
            if (course && !course.students.includes(userId)) {
              course.students.push(userId);
              await course.save();
              await ProgressModel.create({
                course: courseId,
                completedLessons: [],
                completedVideos: [],
                user: userId,
              });
            }
          })
        );
        const user = await UserModel.findById(userId);

        if (user) {
          const newEnrolledCourses = courseIds.filter(
            (courseId) => !user.enrolledCourses.includes(courseId)
          );
          if (newEnrolledCourses.length > 0) {
            user.enrolledCourses.push(...newEnrolledCourses);
            await user.save();
          }
        }

        // Redirect to frontend with success status
        res.redirect(
          `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
        );
      } else {
        res.status(400).json({ message: "Invalid payment signature" });
      }
    } catch (error) {
      console.error("Payment verification error:", error.message);
      res.status(500).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  }

  async getAllPayments(req, res) {
    try {
      const payments = await PaymentModel.aggregate([
        {
          $lookup: {
            from: "courses",
            localField: "courseIds",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          $unwind: {
            path: "$courseDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            course: "$courseDetails.title",
            user: "$userDetails.email",
          },
        },
        {
          $project: {
            razorpay_order_id: 0,
            razorpay_payment_id: 0,
            razorpay_signature: 0,
            courseDetails: 0,
            userDetails: 0,
            courseIds: 0,
            userId: 0,
          },
        },
      ]);
      res.status(200).json({ status: 200, payments });
    } catch (error) {
      res.status(400).json({ message: `failed to fetch payments ${error} ` });
    }
  }
}

const paymentApiController = new PaymentApiController();
module.exports = paymentApiController;
