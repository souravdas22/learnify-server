const RoleModel = require("../module/role/model/role.model");

class RoleApiController {
  async createRole(req, res) {
    try {
      const { name } = req.body;
      const existingRole = await RoleModel.findOne({ name });
      if (existingRole) {
        return res.status(400).json({ message: "Role already exists" });
      }
      const newRole = new RoleModel({ name });
      await newRole.save();
      res
        .status(201)
        .json({ message: "Role created successfully", role: newRole });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error creating role" });
    }
  }
}

const roleApiController = new RoleApiController();
module.exports = roleApiController;
