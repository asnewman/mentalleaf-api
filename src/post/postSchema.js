const Post = require('./Post');

const postSchema = `
  extend type Mutation {
    addPost(content: String): Post
  }

  type Post {
    content: String!
    author: String!
    date: String!
  }
`;

module.exports = {
  postSchema
};
