var mongoose = require("mongoose");

var Book = mongoose.Schema({
  id: String,
  title: String,
  subtitle: String,
  authors: Array,
  description: String,
  thumbnail: String
})

module.exports = mongoose.model("Book", Book);
