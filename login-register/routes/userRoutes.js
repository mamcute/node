import express from "express";
import { validateToken } from "../middlewares/verifyHandler.js";
import userController from "../controllers/userController.js";

const router = express.Router();

router.route("/register").post(userController.registerUser);
router.route("/login").post(userController.loginUser);
router.route("/send-email").post(userController.forgotPasswordMail);
router.route("/reset-password").post(userController.resetPasswordWithCode);
router
  .route("/change-password")
  .put(validateToken, userController.changePassword);

export default router;
