const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getUserFromDatabase, addUserToDatabase, addRefreshTokenToDatabase, getRefreshTokenFromDatabase, deleteRefreshTokenFromDatabase } = require('./userDAL');
const { validateEmail, validatePassword } = require('./userHelper');

/**
 * Adds a new user to the system
 * @param {String} email User's email
 * @param {String} password User's password
 */
const addUser = async (email, password) => {
  if (await getUserFromDatabase(email)) {
    return {
      __typename: 'AddForbidden',
      reason: 'Email is already in the system'
    };
  }

  if (!validateEmail(email)) {
    return {
      __typename: 'InvalidInput',
      reason: 'Email is not valid'
    };
  }

  if (!validatePassword(password)) {
    return {
      __typename: 'InvalidInput',
      reason: 'Password is not of the following: Minimum eight characters, at least one letter, one number and one special character'
    };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return {
    __typename: 'User',
    user: addUserToDatabase(email, hashedPassword, salt)
  };
};

/**
 * Logs in a user to the system
 * @param {String} email User's email
 * @param {String} password User's password
 */
const loginUser = async (email, password) => {
  const dbUser = await getUserFromDatabase(email);

  // User does not exist
  if (!dbUser) {
    return {
      __typename: 'InvalidInput',
      reason: 'Username or password is incorrect'
    };
  }

  // Verify that password is correct
  const inputtedHashedPassword = await bcrypt.hash(password, dbUser.salt);
  if (inputtedHashedPassword !== dbUser.hashedPassword) {
    return {
      __typename: 'InvalidInput',
      reason: 'Username or password is incorrect'
    };
  }

  // Generate jsonwebtoken - expires in 15 min
  const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 900 });
  const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET);

  addRefreshTokenToDatabase(refreshToken);

  return {
    __typename: 'Tokens',
    accessToken,
    refreshToken
  };
};

/**
 * Using a refresh token, generates a new access token for the user
 * @param {String} refreshToken Refresh token given by the user
 */
const refreshUser = async (refreshToken) => {
  const dbRefreshToken = await getRefreshTokenFromDatabase(refreshToken);

  if (!dbRefreshToken) {
    return {
      __typename: 'InvalidInput',
      reason: 'Refresh token does not exist'
    };
  }

  try {
    const user = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 900 });
    return {
      __typename: 'AccessToken',
      accessToken
    };
  } catch {
    return {
      __typename: 'InvalidInput',
      reason: 'Refresh token is invalid'
    };
  }
};

/**
 * Logs out a user by delete the existing refresh token
 * @param {String} refreshToken Refresh token to delete
 */
const logoutUser = async (refreshToken) => {
  const deleteRes = await deleteRefreshTokenFromDatabase(refreshToken);

  if (deleteRes.deletedCount === 0) {
    return {
      success: false
    };
  }

  return {
    success: true
  };
};

module.exports = {
  addUser,
  loginUser,
  refreshUser,
  logoutUser
};
