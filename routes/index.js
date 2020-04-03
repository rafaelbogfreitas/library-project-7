const express = require('express');
const router = express.Router();
const Book = require('../models/book');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

// books
router.get('/books', (req, res, next) => {
  Book
    .find().sort({
      title: 1
    })
    .then(books => {
      // console.log(booksFromMongoDB);
      res.render('books', {
        books
      });

    })
    .catch(error => console.log(error));
});

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

router.get('/book-add', (req, res) => {
  res.render('book-add');
})

// POST add book

router.post('/book-add', (req, res) => {
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
      location
    })
    .then(response => {
      console.log(response);
      res.redirect('/books');
    })
    .catch(error => console.log(error));
});

// book edit
// GET form

router.get('/book-edit/:bookId', (req, res) => {
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
    rating
  } = req.body;

  const {
    bookId
  } = req.query;

  Book.findByIdAndUpdate(bookId, {
      $set: {
        title,
        author,
        description,
        rating
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


module.exports = router;