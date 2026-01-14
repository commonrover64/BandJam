const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      // who booked the room
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    room: {
      // which room got booked
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: true,
    },
    date: {
      type: String, // date (yy,mm,dd)
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bookings", bookingSchema);
