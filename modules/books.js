var request = require("request");
var searchQueryURL = "https://www.googleapis.com/books/v1/volumes?q=";
var volumeQueryURL = "https://www.googleapis.com/books/v1/volumes/";
var books_key = "key="+process.env.BOOKS_API_KEY;
var Book = require("../models/books.js");
var SearchResult = require("../models/searchresults.js");


var BookSearch = function(){};

// Gets the important information for a certain title.
BookSearch.prototype.getInfo = (bookIDs, callback) => {

  if(!bookIDs) return callback(null, []);

  bookIDs = Array.isArray(bookIDs) || [bookIDs];
  var callbackCount = bookIDs.length;
  var books = [];

  bookIDs.forEach((id) => {
    // First check if its in the DB already.
    Book.findOne({id: id}, (err, book) => {
      if(err) return callback(err);
      if(book) {
        books.push(book);
        callbackCount--;
        if(callbackCount == 0) callback(null, books);
        return;
      }

      request(volumeQueryURL+id+"?"+books_key, (err, response, book) =>{
        console.log(response);
        book = JSON.parse(book);
        var newBook = new Book();

        if(err) return callback(err);
        console.log(book);

        // We dont need everything.
        newBook.id = book.id;
        newBook.title = book.volumeInfo.title;
        newBook.subtitle = book.volumeInfo.subtitle;
        newBook.authors = book.volumeInfo.authors;
        newBook.description = book.description;
        newBook.thumbnail = book.volumeInfo.imageLinks.thumbnail;

        newBook.save((err)=>{
          if(err) return callback(err)
            else books.push(newBook);
            callbackCount--;
            if(callbackCount == 0) callback(null, books);
        })
      })
    }) 
  })
}

// Generic book search. queryString can be many things like title, genre, author, etc.
BookSearch.prototype.searchBooks = (queryString, callback) => {
  searchCache(queryString, callback);
}

// First we search the cache 
//-----------------------------
function searchCache(queryString, callback){
  SearchResult.findOne({query: queryString}, (err, searchresult) => {
    if(err) return callback(err);
    if(!searchresult) return searchOnline(queryString, callback);
    callback(null, searchresult.results, "We got the data from our database");
  })
}

// If we dont find anything we search online
//--------------------------------------------
function searchOnline(queryString, callback){
  request(searchQueryURL + queryString + "&" + books_key, (err, response, body) => {
    body = JSON.parse(body);
    if(body.totalItems == 0) return callback(null, false, "No books were found"); // In case no books were found return false and a Message.

    var books = body.items.map((book) => {
      var newBook = new Book();
      newBook.id = book.id;
      newBook.title = book.volumeInfo.title;
      newBook.subtitle = book.volumeInfo.subtitle || "";
      newBook.authors = book.volumeInfo.authors || "";
      newBook.description = book.description ||  (book.searchInfo && book.searchInfo.textSnippet ) || "";
      newBook.thumbnail = book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail || "https://books.google.at/googlebooks/images/no_cover_thumb.gif";
      newBook.save((err)=>{
        if(err) return callback(err);
      })
      return newBook;
    })

    var newSearchResult = new SearchResult();
    newSearchResult.query = queryString;
    newSearchResult.results = books;
    newSearchResult.save((err)=>{
      if(err) return callback(err);
      callback(null, books, "We got brandnew data");
    })
  })
}

module.exports = new BookSearch();
