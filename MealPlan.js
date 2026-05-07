const mongoose = require("mongoose");

const mealPlanItemSchema = new mongoose.Schema(
  {
    day: String,
    breakfast: mongoose.Schema.Types.Mixed,
    lunch: mongoose.Schema.Types.Mixed,
    dinner: mongoose.Schema.Types.Mixed,
    totalCalories: Number,
    totalCost: Number,
  },
  { _id: false },
);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    budget: { type: Number, required: true },
    preferences: [{ type: String }],
    weeklyPlan: [mealPlanItemSchema],
    totalCalories: Number,
    totalCost: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("MealPlan", mealPlanSchema);
