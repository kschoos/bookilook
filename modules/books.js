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
  request(searchQueryURL + queryString + "&" + books_key, (err, response, body) => {
    body = JSON.parse(body);
    if(body.totalItems == 0) return callback(null, false, "No books were found"); // In case no books were found return false and a Message.

    var books = body.items.map((book) => {
      var newBook = {};
      newBook.id = book.id;
      newBook.title = book.volumeInfo.title;
      newBook.subtitle = book.volumeInfo.subtitle || "";
      newBook.authors = book.volumeInfo.authors || "";
      newBook.description = book.description || "";
      newBook.thumbnail = book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail || "https://books.google.at/googlebooks/images/no_cover_thumb.gif";
      if(!book.volumeInfo.imageLinks) console.log(book);
      return newBook;
    })
    return callback(null, books, "Everything as expected.");
  })
}


module.exports = new BookSearch();
