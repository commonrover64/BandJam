const express = require("express");
const app = express();
require("dotenv").config();
const connect = require("./config/db");
const userRoute = require("./routes/uesrRoute");
const port = 3001;
connect();
app.use(express.json());

app.use("/bpr/users", userRoute);

app.listen(port, () => {
  console.log(`server started at port: ${port}`);
});