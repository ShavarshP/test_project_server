const Router = require("express").Router;
const userController = require("../controllers/user-controller");
const router = new Router();
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");

router.post(
  "/registration",
  body("email").isEmail(),
  body("userName").isLength({ min: 2, max: 32 }),
  body("fullName").isLength({ min: 4, max: 32 }),
  body("password").isLength({ min: 6, max: 32 }),
  userController.registration
);
// router.post("/tration", userController.tration);
// router.get("/auth/linkedin/callback", userController.authenticateLinkedin);
router.get("/refresh", userController.refresh);
router.get("/activate/:link", userController.activate);
router.get("/user", authMiddleware, userController.getUsers);
router.post("/login-user", userController.login);
router.get("/logout", userController.logout);
router.put("/update-click-count", authMiddleware, userController.updateCount);
router.get("/all-users", authMiddleware, userController.getAllUsers);
router.put("/update-user", authMiddleware, userController.updateUserData);
router.delete("/delete-user", authMiddleware, userController.deleteUserData);

module.exports = router;
