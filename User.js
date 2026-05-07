const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    preferences: {
      diet: { type: String, default: "veg" },
      cuisines: [{ type: String }],
      budget: { type: Number, default: 1200 },
    },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    refreshTokens: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
