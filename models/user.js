// models/user.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    // unique: true,
    // required: true
  },
  password: {
    type: String,
    // required: true
  },
  googleID: String,
  slackID: String,
  role: {
    type: String,
    enum: ['GUEST', 'EDITOR', 'ADMIN'],
    default: 'GUEST'
  },
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;