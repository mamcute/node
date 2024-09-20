const express = require("express");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();
const errorHandler = require("./middlewares/errorHandler");
// const session = require("express-session");
// const redisClient = require("./config/redisClient"); // Kết nối đến Redis
// const RedisStore = require("connect-redis")(session); // Lưu trữ session trong Redis
const routers = require("./routes")
connectDb(); // Kết nối database
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

// Định tuyến người dùng
app.use("/api", routers);

app.use(errorHandler); // Xử lý lỗi

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
