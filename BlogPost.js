const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: String,
  body: String,
  date: { type: Date, default: Date.now }  // Ensure you have a date field
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
