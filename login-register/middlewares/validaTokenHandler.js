const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
// Xac thuc token de bt user nay co quyen j
const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    console.log('token: ',token)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("User is not authorized");
      }
      req.user = decoded;
      next();
    });
    
  }
  if (!token) {
    return res
      .status(401)
      .json({ message: "User is not authorized or token is missing" });
  }
});
module.exports = validateToken;
