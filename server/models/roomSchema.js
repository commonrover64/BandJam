const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // this is the reference table from where the id will be coming
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    equipments: {
      type: Array,
      required: false,
      default: [],
    },
    description: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("rooms", roomSchema);
