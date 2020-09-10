require('dotenv').config();
const express = require('express');
const expressGraphQL = require('express-graphql');
const { buildSchema, defaultTypeResolver } = require('graphql');
const morgan = require('morgan');

const { getClient } = require('./database');
const { removeSensitiveInfo } = require('./utilities');
const { userSchema } = require('./user/userSchema');
const { userResolvers } = require('./user/userResolvers');
const { postSchema } = require('./post/postSchema');
const { postResolvers } = require('./post/postResolvers');

const app = express();

const schemaString = (`
  type Query {
    hello: String
  }

  type Mutation {
    hello: String
  }

  ${userSchema}

  ${postSchema}
`);

const schema = buildSchema(schemaString);

const root = {
  hello: () => {
    return 'Hello World';
  },
  ...userResolvers,
  ...postResolvers
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

// Endpoint to destory database
if (process.env.RUN_ENVIRONMENT === 'dev') {
  app.use('/nuke', async function (req, res) {
    const collections = ['users', 'refreshTokens'];
    const client = await getClient();

    for (const collection of collections) {
      console.warn('Dropping collection', collection);
      try {
        await client.db().collection(collection).drop();
      } catch {
        console.log('Could not drop collection', collection);
      }
    }

    res.send(200);
  });
}

app.listen(5000, () => console.log('Server Running'));
