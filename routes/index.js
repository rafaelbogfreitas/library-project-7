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
    .find()
    .then(books => {
      // console.log(booksFromMongoDB);
      res.render('books', {
        books
      });

    })
    .catch(error => console.log(error));
});

// book detail route

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
  console.log(req.body);
  res.redirect('/books');
});

module.exports = router;