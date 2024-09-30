import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      require: [true, "Please add the user name"],
    },
    email: {
      type: String,
      require: [true, "Please add the user email address"],
      unique: [true, "Email address already taken"],
    },
    password: {
      type: String,
      require: [true, "Please add the user password"],
    },
    pin_code: String,
    products: {
      // moi quan he 1-n
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
    recent_passwords: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecentPassword",
      default: [],
    },
  },
  // hien thi time trong database
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
export default User;
