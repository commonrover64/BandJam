const express = require("express");
const pool = require("./src/config/db");
const migrate = require("./migrations/migrate");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require("./src/modules/auth/auth.routes");
const ownerRoutes = require("./src/modules/owners/owners.routes");

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/owners", ownerRoutes);

migrate().then(() => {
  app.listen(PORT, () => {
    console.log("Server started at port:", PORT);
  });
});
