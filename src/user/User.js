const mongoose = require('mongoose');

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
