const express = require("express");
const pool = require("./src/config/db");
const migrate = require("./migrations/migrate");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

migrate().then(() => {
  app.listen(PORT, () => {
    console.log("Server started at port:", PORT);
  });
});