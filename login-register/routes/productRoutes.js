const express = require('express')
const {createProduct} = require('../controllers/productController')
const validateTokenHandler = require('../middlewares/validaTokenHandler')
const router = express.Router();

router.route('/').post(validateTokenHandler,createProduct);
 
module.exports = router
