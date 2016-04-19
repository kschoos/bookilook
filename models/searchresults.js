var mongoose = require("mongoose");

var SearchResult = mongoose.Schema({
  query: String,
  results: Array,
  searchedAt: {
    type: Date,
    expires: 600,
    default: Date.now
  }
})

module.exports = mongoose.model("SearchResult", SearchResult);
