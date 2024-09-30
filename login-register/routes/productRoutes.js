// const express = require('express')
import express from "express";
import {createProduct} from "../controllers/productController"
// const {createProduct} = require('../controllers/productController')
// const validateTokenHandler = require('../middlewares/validaTokenHandler')
import { validateToken } from "../middlewares/verifyHandler";
const router = express.Router();

router.route('/').post(validateToken,createProduct);
 
export default router;
