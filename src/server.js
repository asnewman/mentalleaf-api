require('dotenv').config();
const express = require('express');
const expressGraphQL = require('express-graphql');
const { buildSchema, defaultTypeResolver } = require('graphql');
const morgan = require('morgan');

const { removeSensitiveInfo } = require('./utilities');
const { addUser } = require('./user/userService');

const app = express();

const schema = buildSchema(`
  type Query {
    hello: String
  }

  type Mutation {
    addUser(input: UserInput): AddUserResult 
  }

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

  union AddUserResult = User | AddForbidden | InvalidInput
`);

const root = {
  hello: () => {
    return 'Hello World';
  },
  addUser: ({ input }) => {
    const { email, password } = input;
    return addUser(email, password);
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
