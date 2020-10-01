const postSchema = `
  extend type Mutation {
    addPost(content: String!): PostResult
    editPost(_id: String!, content: String!): EditPostResult
    deletePost(_id: String!): DeleteResult
  }

  union PostResult = Post | InvalidUser

  union EditPostResult = Post | InvalidUser | InvalidPost

  type Post {
    _id: String!
    content: String!
    author: String!
    date: String!
  }

  type InvalidUser {
    reason: String!
  }

  type InvalidPost {
    reason: String!
  }

  type DeleteResult {
    isDeleted: Boolean!
    reason: String
  }

`;

module.exports = {
  postSchema
};
