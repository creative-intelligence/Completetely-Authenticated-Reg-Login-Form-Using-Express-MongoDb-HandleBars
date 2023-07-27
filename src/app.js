require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt =require("jsonwebtoken")
const cookieParser=require("cookie-parser")
const auth=require("./middleware/auth")

require("./db/conn");
const users = require("./models/users");

const port = process.env.PORT || 8000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

// Add middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));

app.use(express.json());
app.use(cookieParser())
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);


console.log(process.env.SECRET_KEY)

app.get("/", (req, res) => {
  res.render("register");
});
app.get("/secret",auth, (req, res) => {
  // console.log(` This is cookies ${req.cookies.jwt}`)
  res.render("secret");
});
app.get("/logout",auth, async(req, res) => {
  // console.log(` This is cookies ${req.cookies.jwt}`)
  // res.render("login");
  try{
    // for logout from a single device 
    // req.user.tokens = req.user.tokens.filter((token) => {
    //   return token.token !== req.token;
    // });

    // for logout from all devices
    req.user.tokens=[]
    await req.user.save();

    res.clearCookie("jwt");

    console.log("Logout Successful");
    res.render("login");
  } catch (err) {
    res.status(500).send(err);
  }
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login",(req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if (password === cpassword) {
      const registeredUsers = new users({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        age: req.body.age,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
        gender: req.body.gender,
      });

      // Before saving data into database
      // and after getting the data from user registration form
      // we do password hashing to protect it from hacking

      // Password Hash

      // Middleware to assign json web token to each id

    
    
      const token = await registeredUsers.generateAuthToken();
      console.log("my token is " + token);

      // res.cookie()  function is used to set the cookie name tovalue to add our our token to it
      // the value parameter may be a string or object converted to JSON

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set cookie expiration time (1 day in this example)
        httpOnly: true, // Ensure the cookie is only accessible via HTTP(S)
        secure: false, // Set to true if using HTTPS
      });


      // registeredUsers.tokens = registeredUsers.tokens.concat({ token });

      const registered = await registeredUsers.save();
      console.log("Token Part: " + registered.tokens[0].token);
      // const registered = await registeredUsers.save();
      res.status(201).render("login");
      //   alert("User Registered Successfully")
    } else {
      res.send("Password not matched");
    }

    // res.send(req.body.firstname)
  } catch (err) {
    res.send(err);
  }
});

// Login Form Validation
app.post("/login", async (req, res) => {
  try {
    // user email and password
    const email = req.body.email;
    const password = req.body.password;

    // Database email and password
    const userEmail = await users.findOne({ email: email });
    // Password comparison with database when user is logging in after bcrypt/hash
    // First parameter is the password that user will enter
    // 2nd parameter is the password that is stored in the database along with email
    // bcrypt.compare is the method to compare two password after hashing
    const isMatch = await bcrypt.compare(password, userEmail.password);
    const token = await userEmail.generateAuthToken();
      console.log("my token is " + token);

      // Sending jwt token with cookies
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 50000), // Set cookie expiration time (1 day in this example)
        httpOnly: true, // Ensure the cookie is only accessible via HTTP(S)
        secure: false, // Set to true if using HTTPS
      });
      // console.log(` This is cookies ${req.cookies.jwt}`)
    // console.log(`My userpassword is ${password} and my registered password is ${userEmail.password}`)
    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("Incorrect Password");
    }

    // console.log(userEmail.password)

    // console.log(`My email ${ email} and password is ${password}`)
  } catch (err) {
    res.status(400).send("Invalid Login Details");
  }
});



app.listen(port, () => {
  console.log(`server is running on port ${port} `);
});
