const express = require("express");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();
const session = require("express-session");
// const redisClient = require("./config/redisClient"); // Kết nối đến Redis
const RedisStore = require("connect-redis")(session); // Lưu trữ session trong Redis
const Redis = require("ioredis");
const redisClient = new Redis();
connectDb(); // Kết nối database
const app = express();

const port = process.env.PORT || 5000;

// Thiết lập session với RedisStore
app.use(session({
  secret:process.env.COOKIE_SECRET, 
  credentials:true,
  name:"$id",
  store: new RedisStore({client:redisClient}), //This is the user's session information
  resave:false,
  saveUninitialized:false,
  cookie: {
      secure:process.env.ENVIRONMENT === "production" ? "true" : "auto",
      httpOnly:true,
      expires: 1000 * 60 * 60 * 24 * 7,
      sameSite:process.env.ENVIRONMENT === "production" ? "none" : "lax",
  }
}))

app.use(express.json());

// Định tuyến người dùng
app.use("/api/users", require("./routes/userRoutes"));

app.use(errorHandler); // Xử lý lỗi

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});