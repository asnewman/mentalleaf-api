import express from 'express';
import expressGraphQL from 'express-graphql';
import { buildSchema } from 'graphql';

const app = express();

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true
}));

app.listen(5000, () => console.log('Server Running'))