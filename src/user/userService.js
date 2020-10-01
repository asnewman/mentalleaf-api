const jwt = require('jsonwebtoken');
const { User } = require('./User');

const getUserByAccessToken = async (accessToken) => {
  try {
    const decoded = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const { email } = decoded;

    const user = User.findOne({ email }).exec();
    return user;
  } catch {
    return null;
  }
};

module.exports = {
  getUserByAccessToken
};
