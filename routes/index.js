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

// create a new route (/book/id)that receives the book id
// and show in a view its contents

// have fun!

module.exports = router;