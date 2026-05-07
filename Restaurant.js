const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    calories: { type: Number, required: true },
    category: { type: String, required: true },
    veg: { type: Boolean, default: true },
    description: { type: String, default: "" },
    tags: [{ type: String }],
  },
  { _id: true },
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    cuisine: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    deliveryTime: { type: String, default: "20-30 min" },
    tags: [{ type: String }],
    menu: [menuItemSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
