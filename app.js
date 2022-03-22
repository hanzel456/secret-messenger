//jshint esversion:6
require('dotenv').config();
const http = require('http')
const express = require("express");
const socketio = require('socket.io');
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
//lvl 6 oauth
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//chat
const path = require('path');
const server = http.createServer(app);
const io = socketio(server);
const formatMessage = require('./utils/messages');

app.use("/favicon.ico", express.static("public/images/favicon.ico"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:true}));
//passport local: placement above mongoose connect important.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// passport init
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://hanzi456:Anila123@cluster0.mxm6i.mongodb.net/messenger?retryWrites=true&w=majority');

userSchema = new mongoose.Schema({
  username:String,
  password:String,
  googleId:String
});

postSchema = new mongoose.Schema({
  user: String,
  post: String
});


//passport-local-schema initialize
userSchema.plugin(passportLocalMongoose);
//
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

const Post = mongoose.model('Post', postSchema);

//passport local init to create the cookie with user info
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//oauth set up(placement important)
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/home",
},
function(accessToken, refreshToken, profile, cb) {
  currentUserGoogle = profile.name.givenName; //name from google
  User.findOrCreate({ googleId: profile.id, username:profile.name.givenName }, function (err, user) {
    return cb(err, user);
  });
}
));

app.route("/")
.get(function (req, res) {
  res.render("index");
});

app.route("/register")
.get((req, res) => {
  res.render("register");
})
.post((req,res) => {
  currentUserLocal = req.body.username;
  User.register({username:req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect('/register');
    } else{
      passport.authenticate('local', { failureRedirect: '/register'})(req,res,function(){
        res.redirect('/home');
      });
    }
  });
});

app.route("/login")
.get(function (req, res) {
  res.render("login");
})
.post((req,res) => {
  currentUserLocal = req.body.username;
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    } else{
    //same code to authenticate user as register post route
    passport.authenticate('local', { failureRedirect: '/login'})(req,res,function(){
      res.redirect('/home');
    });
    }
  });
  });

  app.route('/auth/google')
  .get(passport.authenticate('google', {scope:['profile']}));

  app.get('/auth/google/home', passport.authenticate('google', {failureRedirect: '/register'}),
  (req, res) => {
    res.redirect('/home');
  });

app.route('/home')
.get((req, res) => {
  if(req.isAuthenticated()){
    res.render('home',{user: req.user});
  } else {
    res.redirect('login');
  }
});

app.route('/story')
.get((req, res) => {
  if(req.isAuthenticated()){
    Post.find({}, function(err, posts){
      if(!err){
        res.render('Stories',{posts: posts});
      }
    })
  } else {
    res.redirect('login');
  }
});
// .post((req, res) => {
//   const storyUser = req.user.username;
//   const newPost = new Post ({
//     post: req.body.story,
//     user: storyUser
//   });

//   newPost.save( err => {
//     if(!err){
//       res.redirect('/story')
//     }
//   });
// });

app.route('/contacts')
.get((req, res) => {
  if(req.isAuthenticated()){
  const currentUser = req.user;
  User.find({}, function(err , users){
    res.render('contacts', {users:users, currentUser:currentUser});
  });
} else {
  res.redirect('login');
}
});

//live chat
let currentName;
let bot = 'Secret Chat Bot'
io.on('connection', socket =>{
      //send to current client
  socket.emit('message', formatMessage(bot, 'Welcome to secret chat!'));
  //send to everyone except current client
  socket.broadcast.emit('message', formatMessage(bot, currentName + ' has joined the chat.'));

  socket.on('disconnect', function(){
    //send to everyone
    io.emit('message', formatMessage(bot, currentName + ' has left the chat.'));
  });

  socket.on('chatMessage', (msg)=>{
    io.emit('message', formatMessage(currentName, msg));
  });
});

app.route('/chat/:user')
.get((req,res) =>{
  if(req.isAuthenticated()){
  const param = req.params.user;
  const currentUser = req.user.username;
  currentName = currentUser;
  User.findById(param, function(err, user){
    if(!err){
      res.render('chat', {user:user, currentUser:currentUser});
    };
  });
} else {
  res.redirect('/login')
}
});

app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
});

let port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log("server operational");
});
