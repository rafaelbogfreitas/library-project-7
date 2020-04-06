const express = require('express');
const router = express.Router();
const Book = require('../models/book');

// API books

router.get('/books', (req, res, next) => {
  Book
    .find()
    .then(books => {

      res.json(books);
    })
    .catch(error => console.log(error));
});

module.exports = router;