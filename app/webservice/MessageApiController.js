const MeessageModel = require("../module/admin/message/model/message.model");

class MessageApiController {
  async sendMessage(req, res) {
    try {
      const studentId = req.body.student;
      const instructorId = req.body.instructor;
      const courseId = req.body.course;
      const message = await MeessageModel.create(
        // {
        // student: req.user._id, // Assuming the user is authenticated
        // instructor: req.body.instructor,
        // course: req.body.course,
        // message: req.body.message,
        // }
        {
          student: studentId, // Assuming the user is authenticated
          instructor: instructorId,
          course: courseId,
          message: req.body.message,
        }
      );
      res.status(201).json({
        status: 200,
        message: "Message sent successfully",
        data:message,
      });
    } catch (err) {
      res.status(400).json({ message: `Error sending message: ${err}` });
    }
  }

  // List all messages for a specific user (using MongoDB Aggregation)
  async listMessages(req, res) {
    try {
      let match = {};

      // Filter messages by user role (student or instructor)
      if (req.user.role === "student") {
        match.student = req.user._id;
      } else if (req.user.role === "instructor") {
        match.instructor = req.user._id;
      }

      const messages = await MeessageModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "users", // Name of the User collection
            localField: "student",
            foreignField: "_id",
            as: "studentDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          $project: {
            _id: 1,
            message: 1,
            response: 1,
            status: 1,
            createdAt: 1,
            "studentDetails.name": 1, // Only retrieve student name
            "studentDetails.email": 1, // Only retrieve student email
            "instructorDetails.name": 1, // Only retrieve instructor name
            "instructorDetails.email": 1, // Only retrieve instructor email
            "courseDetails.title": 1, // Only retrieve course title
          },
        },
      ]);

      res.status(200).json({
        status: 200,
        message: "Messages fetched successfully",
        messages,
      });
    } catch (err) {
      res.status(400).json({ message: `Error fetching messages: ${err}` });
    }
  }

  // Instructor responds to a message
  async respondToMessage(req, res) {
    try {
      const messageId = req.params.id;
      const message = await MeessageModel.findById(messageId);

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      if (message.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      message.response = req.body.response;
      message.status = "answered";
      await message.save();

      res.status(200).json({
        status: 200,
        message: "Response sent successfully",
        updatedMessage: message,
      });
    } catch (err) {
      res.status(400).json({ message: `Error responding to message: ${err}` });
    }
  }
}

const messageApiController = new MessageApiController();
module.exports = messageApiController;
