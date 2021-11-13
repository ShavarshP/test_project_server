const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userName: { type: String, required: true },
  isActivated: { type: Boolean, default: true },
  activationLink: { type: String },
  status: { type: String, default: "user" },
  billingPlan: { type: String, default: "standard" },
  visits: { type: Number, default: 1 },
  Click: { type: Number, default: 0 },
});

module.exports = model("User", UserSchema);
