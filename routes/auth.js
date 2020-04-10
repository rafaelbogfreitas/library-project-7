const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const User = require('../models/user');
const Book = require('../models/book');
// passport
const passport = require("passport");
// nodemailer
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Auth Routes

router.get('/signup', (req, res, next) => {
  res.render('signup-form');
});

// signup POST route
router.post('/signup', (req, res, next) => {
  // res.send(req.body);
  // return;

  // in case captcha is not clicked
  if (!req.body["g-recaptcha-response"]) {
    res.render('signup-form', {
      errorMessage: 'please use captcha'
    });
  }

  // forming verification url for axios request
  const verificationKey = process.env.RECAPTCHA_KEY;
  const recaptchaResponse = req.body["g-recaptcha-response"];
  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${verificationKey}&response=${recaptchaResponse}&remoteip=${req.connection.remoteAddress}`;

  axios.get(verificationURL)
    .then(response => {

      if (response.data.success) {
        const {
          username,
          email,
          password,
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
            email,
            password: hashPass
          }).then(user => {
            console.log(user);
            // firing the email
            transport.sendMail({
                from: '"Library Project App" <noreply@ironhack.com>',
                to: user.email,
                subject: 'Welcome to LPApp',
                text: 'Welcome Message',
                html: '<b>Welcome Message</b>'
              })
              .then(info => {
                console.log(info);
                res.redirect('/login');
              })
              .catch(error => {
                console.log(error)
                res.render('signup-form', {
                  errorMessage: error
                })
              });
          })
          .catch(err => res.status(400).render('signup-form', {
            errorMessage: err.errmsg
          }));
      } else {
        res.status(400).render('signup-form', {
          errorMessage: 'captcha not validated'
        })
      }
    })
    .catch(error => console.log(error))




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
  successRedirect: "/books",
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


// one way out to google 
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  })
);

// onde back from google
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/books",
    failureRedirect: "/login" // here you would redirect to the login page using traditional login approach
  })
);

module.exports = router;