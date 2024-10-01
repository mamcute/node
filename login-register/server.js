import express from "express";
import connectDb from "./config/dbConnection.js";
import dotenv from "dotenv";
import errorHandler from "./middlewares/errorHandler.js";
// import const session from "express-session"
// import const redisClient from "./config/redisClient"); // Kết nối đến Red
// import const RedisStore from "connect-redis")(session); // Lưu trữ session trong Red
import routes from "./routes/index.js"

dotenv.config();

connectDb(); // Kết nối database
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

// Định tuyến người dùng
app.use("/api", routes);

app.use(errorHandler); // Xử lý lỗi

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
