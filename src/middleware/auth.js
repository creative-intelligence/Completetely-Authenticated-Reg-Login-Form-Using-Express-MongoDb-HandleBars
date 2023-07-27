const jwt = require("jsonwebtoken");
const Users = require("../models/users");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    console.log(verifyUser);

// Accesing userData from database using token id
    const userData=await Users.findOne({_id:verifyUser._id})
    console.log(userData)
    
    // Logging out after login
    req.token=token;
    req.user=userData
    next(); // Call next() to proceed to the next middleware or route handler
  } catch (error) {
    res.send(error);
  }
};

module.exports = auth;
