const { Post } = require('./Post');
const { ObjectID } = require('mongodb');

const postResolvers = {
  addPost: async (params) => {
    const { content } = params;
    const newPost = new Post({ author: new ObjectID(), content, date: new Date() });
    await newPost.save();

    return newPost._doc;
  }
};

module.exports = {
  postResolvers
};
