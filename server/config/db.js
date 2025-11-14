const mongoose = require("mongoose");

const connect = async () => {
  try {
    const response = await mongoose.connect(process.env.DB_URL)
    console.log("Mongo DB connection successful")
  } catch (error) {
    console.log(`Couldn't connect to database. see error: ${error}`);
  }
};

module.exports = connect