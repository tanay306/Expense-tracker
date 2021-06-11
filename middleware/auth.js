const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../db/models/users');
require('dotenv').config();

const verify = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      let token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SECRET);
      req.user = await User.query().findById(decoded.id);
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  next();
});

module.exports = {verify};
