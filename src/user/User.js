const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  resetCode: String,
  expires: String
});

const userSchema = new mongoose.Schema({
  email: String,
  hashedPassword: String,
  addedDate: Date,
  salt: String,
  resetCode: String,
  resetCodeExpiration: Date
});

const User = mongoose.model('User', userSchema);

module.exports = {
  User
};
