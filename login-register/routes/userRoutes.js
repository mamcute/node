
const express = require("express");
const { registerUser, loginUser, forgotPasswordMail, resetPasswordWithCode } = require("../controllers/userController");
// const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/send-email").post(forgotPasswordMail);
router.route("/reset-password").post(resetPasswordWithCode);

module.exports = router;
