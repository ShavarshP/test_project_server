const Router = require("express").Router;
const userController = require("../controllers/user-controller");
const router = new Router();
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");

router.post(
  "/registration",
  body("email").isEmail(),
  body("userName").isLength({ min: 2, max: 32 }),
  body("password").isLength({ min: 3, max: 32 }),
  userController.registration
);
router.get("/auth/linkedin/callback", userController.authenticateLinkedin);
router.get("/refresh", userController.refresh);
router.get("/activate/:link", userController.activate);
router.get("/user", authMiddleware, userController.getUsers);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.put("/update-click-count", authMiddleware, userController.updateCount);
router.get("/all-users", authMiddleware, userController.getAllUsers);

module.exports = router;
