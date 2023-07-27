const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/registered_users")
  .then(() => console.log("Database Connection successful"))
  .catch((err) => console.log(err));
