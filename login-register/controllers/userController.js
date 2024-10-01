import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient.js";
// import crypto from "crypto"
import nodemailer from "nodemailer";
// ms đẻ chuyển sang tất cả về mili giây
import ms from "ms";
import { StatusCodes } from "http-status-codes";
//@desc Register user
// @route Post /api/users/register
//@access public
// boc asyncHandler de thay khoi try catch

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  //   kiem tra trong database co email nay chua
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered");
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  //   tao 1 user moi trong database
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  if (newUser) {
    // redisClient.set("abc", "123");
    res.status(201).json({ _id: newUser.id, email: newUser.email });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

//@desc Login user
// @route Post /api/users/login
//@access private
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  // Kiểm tra xem có email này trong database không
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Email or password is not valid");
  }

  const lockKey = `lock:${user.id}`; // Key cho Redis để kiểm tra khóa
  const attemptKey = `attempt:${user.id}`; // Key cho Redis để đếm số lần vi phạm

  // Kiểm tra nếu tài khoản bị khóa tạm thời
  redisClient.get(lockKey, async (err, locked) => {
    if (locked) {
      return res
        .status(403)
        .json({ message: "Account locked. Try again later." });
    }
    const userInfo = {
      username: user.username,
      email: user.email,
      id: user.id,
    };
    // So sánh mật khẩu với mật khẩu đã hash
    if (await bcrypt.compare(password, user.password)) {
      // Đăng nhập thành công, reset số lần nhập sai
      redisClient.del(attemptKey);
      const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2m",
      });
      const refreshToken = jwt.sign(
        userInfo,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "10d" }
      );
      /**
       * Xử lý trường hợp trả về httpOnly Cookie cho phía Client
       * maxAge: thời gian sống của Cookie tính theo mili giây để tối đa 14 ngày. Cái này là thời gian sống của Cookie
       */
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: ms("7 days"),
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: ms("7 days"),
      });
      return res.status(200).json({ ...userInfo, accessToken, refreshToken });
    } else {
      // Nếu mật khẩu không đúng, redisClient.incr de tang so lan sai
      await redisClient.incr(attemptKey, (err, attempts) => {
        if (attempts >= 5) {
          // Khóa tài khoản trong 20 phút sau 5 lần nhập sai
          redisClient.setex(lockKey, 1200, true); // 1200 giây (20 phút)
          redisClient.set(attemptKey, 0); // Reset số lần nhập sai
          return res.status(403).json({
            message:
              "Account locked for 20 minutes due to multiple failed attempts.",
          });
        }

        return res
          .status(401)
          .json({ message: `Incorrect password. Attempt ${attempts}/5.` });
      });
    }
  });
});

const forgotPasswordMail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Not found user" });
  }
  //tao ma 6 ki tu bang crypto.randomBytes(6).toString('hex')
  // const codeVerify = crypto.randomBytes(3).toString("hex");
  const codeVerify = Math.floor(100000 + Math.random() * 900000).toString();
  user.pin_code = codeVerify;
  await user.save();
  //luu ma len redis
  // redisClient.set(`reset:${user.id}`,codeVerify)
  // config mail de gui ma
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASSWORD_USER,
    },
  });
  // thiet lap doi tuong gui va noi dung gui
  const mainOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Code to verify",
    text: `Your code to reset password is: ${codeVerify}`,
  };
  //gui code
  transport.sendMail(mainOptions, (error) => {
    if (error) {
      return res.status(500).json({ message: `${error} ` });
    } else {
      return res.status(200).json({ message: "Sent mail successfully" });
    }
  });
});

const resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });

    // const codeVerify = `reset:${user.id}`;
    // redisClient.get(codeVerify,  async (error, codeRedis) => {
    if (!user || user.pin_code !== code) {
      return res.status(400).json({ message: "Code verify wrong!" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.pin_code = undefined;
    await user.save();
    //  redisClient.del(codeVerify);
    return res.status(200).json({ message: "Updated password successfully!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const resetPasswordWithOldPassword = async (req, res) => {
  try {
    const sadasd = "";
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ email: req.user.email });
    if (await bcrypt.compare(currentPassword, user.password)) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      return res
        .status(200)
        .json({ message: "Changed password successfully!" });
    } else {
      return res.status(400).json({ message: "Password wrong!" });
    }
  } catch (error) {
    return res.status(500).json({ message: `${error}` });
  }
};

export default {
  registerUser,
  loginUser,
  forgotPasswordMail,
  resetPasswordWithCode,
  changePassword,
};
