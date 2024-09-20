const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel")
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
  await User.findOneAndUpdate({_id: req.user.id},{$inc:{products:newProduct._id}})
  res
    .status(201)
    .json({ message: "Created product successfully!", data: newProduct });
});

module.exports = { createProduct };
