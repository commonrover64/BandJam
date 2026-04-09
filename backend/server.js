const express = require("express");
const pool = require("./src/config/db");
const migrate = require("./migrations/migrate");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require("./src/modules/auth/auth.routes");
const ownerRoutes = require("./src/modules/owners/owners.routes");
const roomRoutes = require("./src/modules/rooms/rooms.routes");

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/rooms", roomRoutes);

migrate().then(() => {
  app.listen(PORT, () => {
    console.log("Server started at port:", PORT);
  });
});
