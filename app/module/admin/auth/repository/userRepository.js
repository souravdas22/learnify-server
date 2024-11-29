const TokenModel = require("../model/token.model");
const UserModel = require("../model/user.model");

class UserRepositories {
  async save(data) {
    try {
      const newUser = await UserModel.create(data);
      return newUser;
    } catch (error) {
      console.log(error);
    }
  }

  async findUser(query) {
    try {
      const user = await UserModel.findOne(query);
      return user;
    } catch (error) {
      console.log(error);
    }
  }
  async edit(productId, password) {
    try {
      const updatedProduct = await UserModel.findByIdAndUpdate(
        productId,
        password,
        {
          new: true,
        }
      );
      return updatedProduct;
    } catch (error) {
      console.log(error);
    }
  }
  async findToken(query) {
    try {
      const token = await TokenModel.findOne(query);
      return token;
    } catch (error) {
      console.log(error);
    }
  }
  async resetPassword(email, password) {
    try {
      const resetPassword = await UserModel.findOneAndUpdate(email, password, {
        new: true,
      });
      return resetPassword;
    } catch (error) {
      console.log(error);
    }
  }
  async deleteToken(id) {
    try {
      const deletedToken = await TokenModel.deleteOne(id);
      return deletedToken;
    } catch (error) {
      console.log(error);
    }
  }
  async getToken(params) {
    try {
      const token = await TokenModel.findOne(params);
      return token;
    } catch (error) {
      console.log(error);
    }
  }
}

const userRepository =  new UserRepositories();
module.exports = userRepository;
