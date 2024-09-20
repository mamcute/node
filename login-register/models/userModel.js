const mongoose = require("mongoose");

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
    products: {
      // moi quan he 1-n
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: []
    },
  },
  // hien thi time trong database
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", userSchema);
