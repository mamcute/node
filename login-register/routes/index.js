import express from "express";
// const express = require("express");
// const userRoutes = require("./userRoutes");
import userRoutes from "./userRoutes.js";
import productRoutes from "./productRoutes.js";
// const productRoutes = require("./productRoutes");
const router = express.Router();
// const validateTokenHandler = require("../middlewares/validaTokenHandler")

router.use("/users", userRoutes);
// router.use(validateTokenHandler);
router.use("/products", productRoutes);

export default router;
