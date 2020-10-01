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

module.exports = {
  userSchema
};
