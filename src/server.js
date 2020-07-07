require('dotenv').config();
const express = require('express');
const expressGraphQL = require('express-graphql');
const { buildSchema, defaultTypeResolver } = require('graphql');
const morgan = require('morgan');

const { removeSensitiveInfo } = require('./utilities');
const { addUser, loginUser, refreshUser, logoutUser, addResetCode, resetPassword } = require('./user/userService');

const app = express();

const schema = buildSchema(`
  type Query {
    hello: String
  }

  type Mutation {
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
`);

const root = {
  hello: () => {
    return 'Hello World';
  },
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

// Standard REST logging
app.use(morgan(function (tokens, req, res) {
  // Copy body but remove password so it doesn't get logged
  const body = req.body
    ? removeSensitiveInfo(JSON.stringify(req.body), ['password']) : '{}';

  return [
    tokens.date(req, res),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms',
    body
  ].join(' ');
}));
// express.json() allows the logging middleware to log the query
app.use(express.json());

app.use('/graphql', expressGraphQL({
  schema: schema,
  rootValue: root,
  graphiql: true,
  typeResolver: defaultTypeResolver
}));

app.listen(5000, () => console.log('Server Running'));
