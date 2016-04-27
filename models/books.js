var mongoose = require("mongoose");

var Book = mongoose.Schema({
  id: String,
  title: String,
  subtitle: String,
  authors: Array,
  description: String,
  thumbnail: String,
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now
  }
})

var Trade = mongoose.Schema({
  id: String,
  title: String,
  subtitle: String,
  authors: Array,
  description: String,
  thumbnail: String,
  trader: String
})

module.exports = { Book: mongoose.model("Book", Book), Trade: mongoose.model("Trade", Trade)}
