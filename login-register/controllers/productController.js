const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const createProduct = asyncHandler(async (req, res) => {
  const { product_name, product_price, product_description } = req.body;
  if (!product_name || !product_price || !product_description) {
    res.status(400);
    throw new Error("All field are mandatory!");
  }
  const newProduct = await Product.create({
    product_name,
    product_price,
    product_description,
    user_id: req.user.id,
  });
  const updateUser = await User.findOneAndUpdate(
    { _id: req.user.id },
    { $push: { products: newProduct._id } },
    {new:true}
  );
  if (!updateUser) {
    res.status(500);
    throw new Error("Failed to update user's product list");
  }
  res
    .status(201)
    .json({ message: "Created product successfully!", data: newProduct });
});

module.exports = { createProduct };
