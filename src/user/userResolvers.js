const { addUser, loginUser, refreshUser, logoutUser, addResetCode, resetPassword } = require('./userService');

const userResolvers = {
  // Add a new user to the system
  addUser: ({ input }) => {
    const { email, password } = input;
    return addUser(email, password);
  },
  // Login a user
  loginUser: ({ input }) => {
    const { email, password } = input;
    return loginUser(email, password);
  },
  // Use the refresh token to get a new access token
  refreshUser: ({ input }) => {
    const { refreshToken } = input;
    return refreshUser(refreshToken);
  },
  // Deletes the given refreshToken
  logoutUser: ({ input }) => {
    const { refreshToken } = input;
    return logoutUser(refreshToken);
  },
  // Starts the password reset process
  addResetCode: ({ input }) => {
    const { email } = input;
    return addResetCode(email);
  },
  // Reset password
  resetPassword: ({ input }) => {
    const { email, newPassword, resetCode } = input;
    return resetPassword(email, newPassword, resetCode);
  }
};

module.exports = {
  userResolvers
};
