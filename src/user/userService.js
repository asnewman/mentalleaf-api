const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { getUserFromDatabase, addUserToDatabase, addRefreshTokenToDatabase, getRefreshTokenFromDatabase, deleteRefreshTokenFromDatabase, addPasswordResetCodeToDatabase, updateUserPassword } = require('./userDAL');
const { validateEmail, validatePassword } = require('./userHelper');
const { emailUser } = require('../utilities');

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

  const newUser = await addUserToDatabase(email, hashedPassword, salt);

  return {
    __typename: 'User',
    ...newUser
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

/**
 * Adds a reset code to the user's account
 * @param {String} email User account to add reset code to
 */
const addResetCode = async (email) => {
  const code = crypto.randomBytes(4).toString('hex');

  // 15 minute temporary code
  const addRes = await addPasswordResetCodeToDatabase(email, code, 900000);

  if (addRes.modifiedCount === 0) {
    return { success: false };
  }

  if (!emailUser(email, 'Password Reset Code', `Here is your password reset code: ${code}`)) {
    return { success: false };
  }

  return { success: true };
};

/**
 * Resets the user's password
 * @param {String} email Email of the user to update
 * @param {String} newPassword New password
 * @param {String} resetCode Reset code for the updating the password
 */
const resetPassword = async (email, newPassword, resetCode) => {
  // First check to see if the reset code is correct
  const user = await getUserFromDatabase(email);

  if (!validatePassword(newPassword)) {
    return {
      __typename: 'InvalidInput',
      reason: 'Password is not of the following: Minimum eight characters, at least one letter, one number and one special character'
    };
  }

  // Entered email does not exist in the system
  if (!user) {
    return {
      __typename: 'InvalidInput',
      reason: 'User does not exist'
    };
  }

  if (user.passwordReset.resetCode !== resetCode) {
    return {
      __typename: 'InvalidInput',
      reason: 'Reset code is invalid'
    };
  }

  if (new Date() > user.passwordReset.expiresIn) {
    return {
      __typename: 'InvalidInput',
      reason: 'Reset code is expired'
    };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const updatedPasswordResult = await updateUserPassword(email, hashedPassword, salt);

  if (updatedPasswordResult.modifiedCount === 0) {
    return {
      __typename: 'ResetPasswordSuccess',
      success: false
    };
  }

  return {
    __typename: 'ResetPasswordSuccess',
    success: true
  };
};

module.exports = {
  addUser,
  loginUser,
  refreshUser,
  logoutUser,
  addResetCode,
  resetPassword
};
