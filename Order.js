const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    price: Number,
    calories: Number,
    category: String,
    veg: Boolean,
    description: String,
    tags: [String],
    restaurantId: String,
    restaurantName: String,
    quantity: Number,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    restaurantName: { type: String, required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Placed", "Paid", "Preparing", "Delivered", "Cancelled"],
      default: "Placed",
    },
    paymentId: String,
    paymentStatus: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
