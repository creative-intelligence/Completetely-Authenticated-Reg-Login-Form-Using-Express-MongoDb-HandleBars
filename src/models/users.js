const mongoose = require("mongoose");
const bcrypt=require("bcryptjs")
const jwt =require ("jsonwebtoken")
const usersSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    default: 0,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  tokens:[{
    token:{
      type :String ,
      required:true}
  }]
});
  // Before saving data into database
      // and after getting the data from user registration form
      // we do password hashing to protect it from hacking

      // Password Hash
 // middleware

//  Generating Token 

usersSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign(
      { _id: this._id.toString() },process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token:token});
    await this.save();
    console.log("Token Part: " + this.tokens[0].token);

    return token;
  } catch (err) {
    console.log(err);S
  }
};

 usersSchema.pre("save", async function (next) {

  if(this.isModified("password")){
 // console.log(`My current password is ${this.password}`);
 this.password = await bcrypt.hash(this.password, 10);
 // console.log(`My current password is ${this.password}`);
 this.confirmpassword =await bcrypt.hash(this.password, 10);
  }
 
  next();
});





// Creating Collection 

const users =new mongoose.model("user",usersSchema)
module.exports=users;
