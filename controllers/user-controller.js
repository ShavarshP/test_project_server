const userService = require("../service/user-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error");

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()));
      }
      const { email, password, userName, fullName, billingPlan } = req.body;
      const userData = await userService.registration(
        email,
        password,
        userName,
        fullName,
        billingPlan
      );
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  // authenticateLinkedin = (req, res, next) => {
  //   const {
  //     linkedinFromURL,
  //     withMeAss,
  //     view_job: viewJob,
  //     referer,
  //   } = req.query;
  //   let state = { linkedinFromURL, withMeAss, viewJob, referer };
  //   state = JSON.stringify(state);
  //   passport.authenticate("linkedin", {
  //     state,
  //     scope: ["r_liteprofile", "r_emailaddress"],
  //   })(req, res, next);
  // };

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      await userService.getUpdateVisitsCount(userData.user.id);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      console.log({ sssss: "sssssssss" });
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const { id } = req.user;
      const users = await userService.getUser(id);
      return res.json({ users });
    } catch (e) {
      next(e);
    }
  }
  async getAllUsers(req, res, next) {
    try {
      const { id } = req.user;
      if (id != "6190f598fedf676a7b7a4607") {
        throw ApiError.BadRequest("You are not an admin");
      }
      const users = await userService.getAllUsers();
      return res.json({ users });
    } catch (e) {
      next(e);
    }
  }
  async updateUserData(req, res, next) {
    try {
      const { id } = req.user;
      const { UserId, userName, fullName, billingPlan } = req.body;
      if (id != "6190f598fedf676a7b7a4607") {
        throw ApiError.BadRequest("You are not an admin");
      }
      const data = await userService.getUpdateUserData(
        UserId,
        userName,
        fullName,
        billingPlan
      );
      return res.json({ data });
    } catch (e) {
      next(e);
    }
  }
  async deleteUserData(req, res, next) {
    try {
      const { id } = req.user;
      const { UserId } = req.body;
      if (id != "6190f598fedf676a7b7a4607") {
        throw ApiError.BadRequest("You are not an admin");
      }
      const data = await userService.getDeleteUserData(UserId);
      return res.json({ data });
    } catch (e) {
      next(e);
    }
  }
  async updateCount(req, res, next) {
    try {
      const { id } = req.user;
      const data = await userService.getUpdateClickCount(id);
      return res.json(data);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
