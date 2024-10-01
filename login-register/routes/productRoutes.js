// const express = require('express')
import express from "express";
import productController from "../controllers/productController.js"
// const {createProduct} = require('../controllers/productController')
// const validateTokenHandler = require('../middlewares/validaTokenHandler')
import { validateToken } from "../middlewares/verifyHandler.js";
const router = express.Router();

router.route('/').post(validateToken,productController.createProduct);
 
export default router;
