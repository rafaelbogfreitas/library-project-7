require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

// basic auth 
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

// passport
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require('./models/user');
const flash = require("connect-flash");
const bcrypt = require('bcrypt');

// social login
const SlackStrategy = require("passport-slack").Strategy;


mongoose
  .connect('mongodb://localhost/library-project-7', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// basic auth middleware setup
app.use(session({
  secret: "banana",
  // cookie: {
  //   maxAge: 15000 // 15sec
  // },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  rolling: true,
  resave: false,
  saveUninitialized: true
}));

// passport
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

// adding flash to be used with passport
app.use(flash());

// passport local strategy
passport.use(new LocalStrategy({
  passReqToCallback: true
}, (req, username, password, next) => {
  User.findOne({
    username
  }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, {
        message: "Incorrect username"
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, {
        message: "Incorrect password"
      });
    }
    // on success
    return next(null, user);
  });
}));

// passport slack strategy
passport.use(
  new SlackStrategy({
      clientID: process.env.SLACK_clientID,
      clientSecret: process.env.SLACK_clientSecret,
      callbackURL: "/auth/slack/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // to see the structure of the data in received response:
      console.log("Slack account details:", profile);

      User.findOne({
          slackID: profile.id
        })
        .then(user => {
          // user already exists
          if (user) {
            // creates the session successfully
            done(null, user);
            return;
          }

          // otherwise we create him/her
          User.create({
              slackID: profile.id
            })
            .then(newUser => {
              done(null, newUser);
            })
            .catch(err => done(err)); // closes User.create()
        })
        .catch(err => done(err)); // closes User.findOne()
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());
// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// static assets - public folder config
app.use(express.static(path.join(__dirname, 'public')));


app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';



const index = require('./routes/index');
const auth = require('./routes/auth');
const api = require('./routes/api');
app.use('/', auth);
app.use('/api', api);
app.use('/', index);


module.exports = app;