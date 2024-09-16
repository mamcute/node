const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redisClient");
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

    // So sánh mật khẩu với mật khẩu đã hash
    if (await bcrypt.compare(password, user.password)) {
      // Đăng nhập thành công, reset số lần nhập sai
      redisClient.del(attemptKey);
      const accessToken = jwt.sign(
        {
          user: {
            username: user.username,
            email: user.email,
            id: user.id,
          },
        },
        process.env.ACCESS_TOKEN_SECERT,
        { expiresIn: "15m" }
      );
      return res.status(200).json({ accessToken });
    } else {
      // Nếu mật khẩu không đúng
      redisClient.incr(attemptKey, (err, attempts) => {
        if (attempts >= 5) {
          // Khóa tài khoản trong 20 phút sau 5 lần nhập sai
          redisClient.setex(lockKey, 1200, true); // 1200 giây (20 phút)
          redisClient.set(attemptKey, 0); // Reset số lần nhập sai
          return res
            .status(403)
            .json({
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

module.exports = { registerUser, loginUser };
