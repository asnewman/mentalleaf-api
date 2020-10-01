const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: mongoose.Types.ObjectId,
  content: String,
  date: Date
});

const Post = mongoose.model('Post', postSchema);

module.exports = {
  Post
};
