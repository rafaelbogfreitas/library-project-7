const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const User = require('../models/user');
const Book = require('../models/book');
// passport
const passport = require("passport");


// Auth Routes

router.get('/signup', (req, res, next) => {
  res.render('signup-form');
});

// signup POST route
router.post('/signup', (req, res, next) => {
  const {
    username,
    password
  } = req.body;

  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  if (username === '' || password === '') {
    console.log(username, password)
    res.render('signup-form', {
      errorMessage: 'please type username and password;'
    });
    return;
  }

  User.create({
      username,
      password: hashPass
    }).then(user => {
      console.log(user);
      res.redirect('/login');
    })
    .catch(err => res.status(400).render('signup-form', {
      errorMessage: err.errmsg
    }));

  // .catch(err => next(err));

});

// LOGIN routes

router.get('/login', (req, res, next) => {
  res.render('login-form');
});

// router.post('/login', (req, res, next) => {
//   const {
//     username,
//     password
//   } = req.body;

//   if (username === '' || password === '') {
//     res.render('login-form', {
//       errorMessage: 'please type username and password'
//     });
//     return;
//   }

//   User.findOne({
//       username
//     })
//     .then(user => {

//       // checking if username exists in database

//       if (!user) {
//         res.render('login-form', {
//           errorMessage: 'invalid username or password'
//         })
//         return;
//       }

//       // since user exits let's check his/her password
//       if (bcrypt.compareSync(password, user.password)) {
//         req.session.currentUser = user;
//         res.redirect('/books');
//       } else {
//         res.render('login-form', {
//           errorMessage: 'invalid password or username'
//         })
//       }

//     })
//     .catch(err => console.log(err));

// });

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true,
}));


// LOGOUT route

router.get('/logout', (req, res) => {
  // basic auth
  // req.session.destroy((err) => res.redirect('/login'));

  //passport
  req.logout();
  res.redirect("/login");
})

// SOCIAL LOGIN

// one way to slack
router.get("/auth/slack", passport.authenticate("slack"));

// one way back from slack
router.get("/auth/slack/callback",
  passport.authenticate("slack", {
    successRedirect: "/books",
    failureRedirect: "/login"
  })
);

module.exports = router;