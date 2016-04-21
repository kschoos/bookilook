var mongoose = require("mongoose");

var Trade = mongoose.Schema({
  id: String,
  title: String,
  subtitle: String,
  authors: Array,
  description: String,
  thumbnail: String
})
