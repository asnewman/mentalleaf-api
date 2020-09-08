const { addUser, loginUser, refreshUser, logoutUser, addResetCode, resetPassword } = require('./user/userService');

const userSchema = `
  extend type Mutation {
    addUser(input: UserInput): AddUserResult
    loginUser(input: UserInput): LoginUserResult
    refreshUser(input: RefreshTokenInput): RefreshUserResult
    logoutUser(input: RefreshTokenInput): LogoutUserResult
    addResetCode(input: ResetCodeInput): AddResetCodeResult
    resetPassword(input: ResetPasswordInput): ResetPasswordResult
  }

  type LogoutUserResult {
    success: Boolean!
  }

  type AddResetCodeResult {
    success: Boolean!
  }

  union AddUserResult = User | AddForbidden | InvalidInput

  union LoginUserResult = Tokens | InvalidInput

  union RefreshUserResult = AccessToken | InvalidInput

  union ResetPasswordResult = ResetPasswordSuccess | InvalidInput

  type User {
    email: String!
    addedDate: String!
  }

  type AddForbidden {
    reason: String
  }

  type InvalidInput {
    reason: String
  }

  input UserInput {
    email: String!
    password: String!
  }

  input ResetCodeInput {
    email: String!
  }

  type Tokens {
    accessToken: String!
    refreshToken: String!
  }

  input RefreshTokenInput {
    refreshToken: String!
  }

  type AccessToken {
    accessToken: String!
  }

  input ResetPasswordInput {
    email: String!
    newPassword: String!
    resetCode: String!
  }

  type ResetPasswordSuccess {
    success: Boolean!
  }
`;

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

export {
  userSchema,
  userResolvers
};
