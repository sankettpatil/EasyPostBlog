const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Import your model
const BlogPost = require('./BlogPost');

// Homepage
app.get('/', (req, res) => {
  BlogPost.find({})
    .then((posts) => {
      res.render('index', { posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Blog creation
app.post('/create', (req, res) => {
  const newPost = new BlogPost({
    title: req.body.title,
    content: req.body.content,
  });
  newPost.save();
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
