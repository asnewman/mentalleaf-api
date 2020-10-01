const { Post } = require('./Post');
const { authMiddleware } = require('../middleware/authMiddleware');
const { applyMiddlewareToResolverMap } = require('../middleware/middleware');

const postResolversWithoutMiddleware = {
  addPost: async (args, context) => {
    const { content } = args;
    const { user } = context;

    const newPost = new Post({ author: user._id, content, date: new Date() });
    await newPost.save();

    return {
      __typename: 'Post',
      ...newPost._doc
    };
  },
  editPost: async (args, context) => {
    const { _id, content: newContent } = args;
    const { user } = context;

    const existingPost = await Post.findById(_id);

    if (!existingPost) {
      return {
        __typename: 'InvalidPost',
        reason: 'Edited post does not exist'
      };
    }

    if (existingPost.author.toString() !== user._id.toString()) {
      return {
        __typename: 'InvalidUser',
        reason: 'User does not own the edited post'
      };
    }

    existingPost.content = newContent;
    existingPost.save();

    return {
      __typename: 'Post',
      ...existingPost._doc
    };
  },
  deletePost: async (args, context) => {
    const { _id } = args;
    const { user } = context;

    const existingPost = await Post.findById(_id);

    if (!existingPost) {
      return {
        isDeleted: false,
        reason: 'Post does not exist'
      };
    }

    if (existingPost.author.toString() !== user._id.toString()) {
      return {
        isDeleted: false,
        reason: 'User does not own the post'
      };
    }

    try {
      await Post.deleteOne({ _id });
      return {
        isDeleted: true
      };
    } catch (e) {
      return {
        isDeleted: false,
        reason: e.message
      };
    }
  }
};

const postResolvers = applyMiddlewareToResolverMap([authMiddleware], postResolversWithoutMiddleware);

module.exports = {
  postResolvers
};
