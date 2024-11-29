const ContactModel = require("../module/admin/contact/model/contact.model");
class ContactApiController {
  async createContact(req, res) {
    try {
      const { userId, message } = req.body;
      await ContactModel.create({
        userId,
        message,
      });
      return res
        .status(201)
        .json({ status: 201, message: "message sent successfully" });
    } catch (err) {
      return res
        .status(400)
        .json({ status: 500, message: `failed sending message ${err}` });
    }
  }
  async getContacts(req, res) {
    try {
      const contacts = await ContactModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            message: 1,
            email: "$user.email",
            name: {
              $concat: ["$user.first_name", " ", "$user.last_name"],
            },
            profile: "$user.profilePicture",
            createdAt: 1,
          },
        },
      ]);
       res.status(200).json({status:200, contacts });
    } catch (error) {
       res
         .status(500)
         .json({ message: "Error fetching reviews", error: error.message });
    }
  }
}
const contactApiController = new ContactApiController();
module.exports = contactApiController;
