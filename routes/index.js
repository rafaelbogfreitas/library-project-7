const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const ensureLogin = require("connect-ensure-login");

// ROLES control

const checkRoles = (role) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      req.logout();
      res.redirect('/login')
    }
  }
}

const checkGuest = checkRoles('GUEST');
const checkEditor = checkRoles('EDITOR');
const checkAdmin = checkRoles('ADMIN');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

// vvvvvvvvvvvvvvv protected routes vvvvvvvvvvvvvv

// router.use((req, res, next) => {
//   if (req.session.currentUser) {
//     next(); // go to the route(s) above
//   } else {
//     res.redirect('/login');
//   }
// });

// book details route

router.get('/book/:bookId', (req, res) => {
  const {
    bookId
  } = req.params;

  Book
    .findById(bookId)
    .then(book => {
      console.log(book);
      res.render('book-details', {
        book
      });
    })
    .catch(error => console.log(error));
});


// book create routes
// GET form

router.get('/book-add', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('book-add');
})

// POST add book

router.post('/book-add', ensureLogin.ensureLoggedIn(), (req, res) => {
  console.log('body: ', req.body);

  const {
    title,
    author,
    description,
    rating,
    latitude,
    longitude
  } = req.body;

  const location = {
    type: 'Point',
    coordinates: [longitude, latitude]
  }

  Book.create({
      title,
      author,
      description,
      rating,
      location,
      owner: req.user._id
    })
    .then(response => {
      console.log(response);
      res.redirect('/books');
    })
    .catch(error => console.log(error));
});

// book edit
// GET form

router.get('/book-edit/:bookId', checkRoles('EDITOR'), (req, res) => {
  const {
    bookId
  } = req.params;
  Book
    .findById(bookId)
    .then(book => {
      // console.log(book);
      res.render('book-edit', book);
    })
    .catch(error => console.log(error));
});

// POST edit
router.post('/book-edit', (req, res) => {
  const {
    title,
    author,
    description,
    rating,
    latitude,
    longitude
  } = req.body;

  const {
    bookId
  } = req.query;

  const location = {
    type: 'Point',
    coordinates: [longitude, latitude]
  }

  Book.findByIdAndUpdate(bookId, {
      $set: {
        title,
        author,
        description,
        rating,
        location
      }
    }, {
      new: true
    })
    .then(response => {
      console.log(response);
      res.redirect(`/book/${bookId}`);
    })
    .catch(error => console.log(error));
});

// implement the delete route and
// redirect to /books

router.get('/book-delete/:bookId', (req, res) => {
  const {
    bookId
  } = req.params;

  Book.findByIdAndRemove(bookId).then(response => {
    console.log(response);
    res.redirect('/books');
  }).catch(error => console.log(error));
});



// books
router.get('/books', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  console.log('user in session ---->', req.session)
  Book
    .find({
      owner: req.user._id
    }).sort({
      title: 1
    })
    .populate('owner')
    .then(books => {
      console.log(books);

      const managedBooks = books.map(book => {
        if (book.owner && book.owner.toString() === req.user._id.toString()) {
          book.isOwner = true;
        }
        return book;
      });
      res.render('books', {
        books: managedBooks,
        user: req.user,
      });

    })
    .catch(error => console.log(error));
});

module.exports = router;