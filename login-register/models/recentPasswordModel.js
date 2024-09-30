import mongoose from "mongoose";
const recentPassword = mongoose.Schema(
  {
    password_recent: [String],
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);
const RecentPassword = mongoose.model("Product", recentPassword);

export default RecentPassword;
