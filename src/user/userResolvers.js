const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { User } = require('./User');
const { addRefreshTokenToDatabase, getRefreshTokenFromDatabase, deleteRefreshTokenFromDatabase } = require('./userDAL');
const { validateEmail, validatePassword } = require('./userHelper');
const { emailUser } = require('../utilities');

const userResolvers = {
  // Add a new user to the system
  addUser: async ({ input }) => {
    const { email, password } = input;

    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
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

    const newUser = new User({
      email,
      hashedPassword,
      salt,
      addedDate: new Date(),
      resetCode: null,
      resetCodeExpiration: null
    });

    await newUser.save();

    return {
      __typename: 'User',
      ...newUser._doc
    };
  },
  // Login a user
  loginUser: async ({ input }) => {
    const { email, password } = input;
    const dbUser = await User.findOne({ email }).exec();

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
  },
  // Use the refresh token to get a new access token
  refreshUser: async ({ input }) => {
    const { refreshToken } = input;
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
  },
  // Deletes the given refreshToken
  logoutUser: async ({ input }) => {
    const { refreshToken } = input;
    const deleteRes = await deleteRefreshTokenFromDatabase(refreshToken);

    if (deleteRes.deletedCount === 0) {
      return {
        success: false
      };
    }

    return {
      success: true
    };
  },
  // Starts the password reset process
  addResetCode: async ({ input }) => {
    const { email } = input;
    const code = crypto.randomBytes(4).toString('hex');

    const updateUser = await User.findOne({ email });

    if (!updateUser) {
      return { success: false };
    }

    // 15 minute temporary code
    updateUser.resetCode = code;

    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);

    updateUser.resetCodeExpiration = expiration;
    await updateUser.save();

    if (!emailUser(email, 'Password Reset Code', `Here is your password reset code: ${code}`)) {
      return { success: false };
    }

    return { success: true };
  },
  // Reset password
  resetPassword: async ({ input }) => {
    const { email, newPassword, resetCode } = input;
    // First check to see if the reset code is correct
    const user = await User.findOne({ email }).exec();

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

    if (user.resetCode !== resetCode) {
      return {
        __typename: 'InvalidInput',
        reason: 'Reset code is invalid'
      };
    }

    if (new Date() > user.resetCodeExpiration) {
      return {
        __typename: 'InvalidInput',
        reason: 'Reset code is expired'
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.hashedPassword = hashedPassword;
    user.salt = salt;
    user.resetCode = null;
    user.resetCodeExpiration = new Date();

    try {
      await user.save();
      return {
        __typename: 'ResetPasswordSuccess',
        success: true
      };
    } catch {
      return {
        __typename: 'ResetPasswordSuccess',
        success: true
      };
    }
  }
};

module.exports = {
  userResolvers
};
