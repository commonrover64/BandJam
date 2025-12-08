const express = require("express");
const app = express();
require("dotenv").config();
const connect = require("./config/db");
const userRoute = require("./routes/userRoute");
const roomRoute = require("./routes/roomRoute");
const port = 3001;
connect();
app.use(express.json());

app.use("/bpr/users", userRoute);
app.use("/bpr/room", roomRoute);

app.listen(port, () => {
  console.log(`server started at port: ${port}`);
});
