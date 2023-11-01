const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const path = require('path');
const flash = require('connect-flash');
const app = express();

var favicon = require('serve-favicon');
var path = require('path');
app.use(favicon(path.join(__dirname, 'favicon.ico')));  // Serve favicon from main directory
const favicon = require('serve-favicon');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// Use serve-favicon middleware to serve the favicon
  // Added this line


const User = require('./models/user');
const BlogPost = require('./BlogPost');

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/create', ensureAuthenticated, (req, res) => {
  res.render('create');
});

app.post('/create', ensureAuthenticated, async (req, res) => {
  const newPost = new BlogPost({
    title: req.body.title,
    body: req.body.content,
    date: new Date()
  });
  try {
    await newPost.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.redirect('/create');
  }
});

app.get('/register', (req, res) => {
  res.render('register', { message: req.flash('error') });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      req.flash('error', 'Username already taken');
      res.redirect('/register');
      return;
    }
    if (password.length < 6 || !(/[a-zA-Z]/.test(password) && /\d/.test(password))) {
      req.flash('error', 'Password must be at least 6 characters long and contain both letters and numbers');
      res.redirect('/register');
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.log(err);
    res.redirect('/register');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true,
}));

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/');
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const posts = await BlogPost.find({}).sort({ date: -1 }).exec();
    res.render('dashboard', { user: req.user, posts: posts });
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
});

app.get('/post/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).exec();
    if (post) {
      res.render('post', { post: post });
    } else {
      res.status(404).send('Post not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



app.use(favicon(path.join(__dirname, 'favicon.ico')));