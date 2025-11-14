const express = require("express");
const app = express();
require("dotenv").config();
const connect = require("./config/db");

app.use(express.json());

connect();

app.listen(process.env.port, () => {
  console.log(`server started at port: ${process.env.port}`);
});
