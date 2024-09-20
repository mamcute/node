const express = require("express");
const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes");
const router = express.Router();
const validateTokenHandler = require("../middlewares/validaTokenHandler")

router.use("/users", userRoutes);
router.use(validateTokenHandler);
router.use("/products", productRoutes)

module.exports = router;
