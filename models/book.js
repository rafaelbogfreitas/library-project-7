// models/book.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: String,
  description: String,
  author: String,
  rating: Number,
  location: {
    type: {
      type: String
    },
    coordinates: [Number]
  }
}, {
  timestamps: true
});

bookSchema.index({
  location: '2dsphere'
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;