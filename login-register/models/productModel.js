const mongoose = require("mongoose");
const Product = mongoose.Schema(
  {
    product_name: {
      type: String,
      require: true,
    },
    product_price: {
      type: Number,
      require: true,
    },
    product_description: String,
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
      
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", Product);
