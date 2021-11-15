const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");

class UserService {
  async registration(email, password, userName, fullName, billingPlan) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `User with mailing address ${email} already exists`
      );
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

    const user = await UserModel.create({
      email,
      password: hashPassword,
      userName,
      fullName,
      billingPlan: billingPlan ? billingPlan : "standard",
      // activationLink,
    });
    // await mailService.sendActivationMail(
    //   email,
    //   `${process.env.API_URL}/api/activate/${activationLink}`
    // );

    const userDto = new UserDto(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  // async activate(activationLink) {
  //   const user = await UserModel.findOne({ activationLink });
  //   if (!user) {
  //     throw ApiError.BadRequest("Incorrect activation link");
  //   }
  //   user.isActivated = true;
  //   await user.save();
  // }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("User with this email was not found");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest("Wrong password");
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    const newDat = users.filter((item) => {
      if (item.status !== "admin") {
        item.password = "******";
        return item;
      }
    });
    return newDat;
  }
  async getUpdateUserData(id, userName, fullName, billingPlan) {
    await UserModel.updateOne(
      { _id: id },
      { userName: userName, fullName: fullName, billingPlan: billingPlan }
    );
    return { isUpdate: true };
  }

  async getUser(id) {
    const users = await UserModel.findOne({ _id: id });
    users.password = "";
    return users;
  }
  async getDeleteUserData(id) {
    await UserModel.deleteOne({ _id: id });
    return { isUpdate: true };
  }
  async getUpdateClickCount(id) {
    await UserModel.updateOne({ _id: id }, { $inc: { Click: 1 } });
    return { isUpdate: true };
  }
  async getUpdateVisitsCount(id) {
    await UserModel.updateOne({ _id: id }, { $inc: { visits: 1 } });
    return { isUpdate: true };
  }
}

module.exports = new UserService();
