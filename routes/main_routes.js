"use strict";

var User = require("../models/users.js");
var Book = require("../models/books.js").Book;
var Trade = require("../models/books.js").Trade;
var EmailVerification = require("../modules/emailverification.js");
var BookSearch = require("../modules/books.js");
var Mails = require("../modules/mails.js");
var TradeOffer = require("../models/tradeoffers.js");

module.exports = function (app, passport) {

  // Home page
  app.get("/", function (req, res) {
    if (req.isAuthenticated()) {
      res.render("index", { data: { authed: true, email: req.user.local.email, username: req.user.local.username } });
    } else res.render("index", { data: { authed: false, email: "" } });
  });

  // Activation route. You get sent here by the verification email.
  app.get("/activate/:code", function (req, res, next) {
    var hash = req.params.code;
    User.findOneAndUpdate({ "local.verificationHash": hash }, // Find the entry with the given hash ...
    { $unset: { "local.createdAt": "", "local.verificationHash": "" }, $set: { "local.verified": true } }, // ... and update it to become verified.
    { new: true }, function (err, user) {
      if (!user) {
        // If we dont know the user...
        res.redirect("/"); // ... send him home
      }
      req.login(user, function (err) {
        if (err) return next(err); // Other wise log him in and send him home.
        res.redirect("/");
      });
      res.end();
    });
  });

  // Book search for generally searching for books (e.g. using the upper right search bar)
  app.post("/searchBooks/:search", function (req, res, next) {
    BookSearch.searchBooks(req.params.search, function (err, books, msg) {
      if (err) return next(err);
      console.log(msg);
      if (!books) {
        return res.send([]);
      }

      if (!req.isAuthenticated()) {
        return res.send(books);
      }

      User.findById(req.user._id, function (err, user) {
        books = books.map(function (book) {
          book.owned = user.local.books.filter(function (id) {
            if (id == book.id) return true;
          }).length > 0;
          return book;
        });
        return res.send(books);
      });
    });
  });

  app.post("/searchTrades", function (req, res, next) {
    Trade.find({}, function (err, trades) {
      if (!req.isAuthenticated()) return res.send(trades);

      User.findById(req.user._id, function (err, user) {
        if (err) return next(err);
        trades = trades.map(function (trade) {
          trade = trade.toObject();
          trade.trade = true;
          trade.mybooks = user.local.book_titles;
          return trade;
        });
        res.send(trades);
      });
    });
  });

  app.post("/offerTrade", function (req, res, next) {
    Mails.sendTradeOffer();
    User.findById(req.body.trader, function (err, user) {
      var offer = new TradeOffer();
      offer.traderBookID = req.body.id;
      offer.offeredBookTitle = req.body.theirBookTitle;
      offer.tradeID = req.body._id;
      offer.trader = req.body.trader;
      offer.offerer = req.user._id;
      offer.save(function (err, o) {
        Mails.sendTradeOffer(req.body.theirBookTitle, user.local.email, req.body.title, o._id, function (err) {
          res.send({ ok: true });
        });
      });
    });
  });

  app.get("/acceptTrade/:tradeOffer", function (req, res, next) {
    TradeOffer.findById(req.params.tradeOffer, function (err, offer) {
      var tradedBookTitle;
      var offeredBookID;
      var callbackCounter = 2;

      // We splice away the books that are removed from every site and then add them to the opposite factions
      User.findById(offer.trader, function (err, trader) {
        console.log(offer.trader);
        var idx = trader.local.book_titles.indexOf(offer.traderBookID);
        tradedBookTitle = trader.local.book_titles.splice(idx, 1)[0];
        trader.local.books.splice(idx, 1);

        trader.save(function (err) {
          if (err) throw err;
        });
        callbackCounter--;
        if (callbackCounter == 0) {
          User.findById(offer.offerer, function (err, offerer) {
            trader.local.book_titles.push(offer.offeredBookTitle);
            trader.local.books.push(offeredBookID);
            trader.save(function (err) {
              if (err) throw err;
            });

            offerer.local.book_titles.push(tradedBookTitle);
            offerer.local.books.push(offer.traderBookID);
            offerer.save(function (err) {
              if (err) throw err;
            });
          });
        }
      });

      User.findById(offer.offerer, function (err, offerer) {
        console.log(offer.offerer);
        var idx = offerer.local.book_titles.indexOf(offer.offeredBookTitle);
        offerer.local.book_titles.splice(idx, 1);
        offeredBookID = offerer.local.books.splice(idx, 1)[0];

        callbackCounter--;
        if (callbackCounter == 0) {
          User.findById(offer.trader, function (err, trader) {
            offerer.local.book_titles.push(tradedBookTitle);
            offerer.local.books.push(offer.traderBookID);
            offerer.save(function (err) {
              if (err) throw err;
            });

            trader.local.book_titles.push(offer.offeredBookTitle);
            trader.local.books.push(offeredBookID);
            trader.save(function (err) {
              if (err) throw err;
            });
          });
        }
      });

      Trade.remove({ _id: offer.tradeID }, function (err) {
        if (err) throw err;
      });
      res.end();
    });
  });

  app.post("/offerBook/:id", function (req, res, next) {
    BookSearch.searchSingle(req.params.id, function (err, book) {
      var trade = new Trade();

      trade.id = book.id;
      trade.title = book.title;
      trade.subtitle = book.subtitle;
      trade.authors = book.authors;
      trade.description = book.description;
      trade.thumbnail = book.thumbnail;
      trade.trader = req.user._id;

      trade.save(function (err) {
        res.end();
      });
    });
  });

  //--------------------------------------------------------------------
  //     getMyBooks : Gets all the books in users database and returns them.
  //--------------------------------------------------------------------

  app.post("/myBooks", isLoggedIn, function (req, res, next) {
    User.findById(req.user._id, function (err, user) {
      BookSearch.searchMultiples(user.local.books, function (err, books) {
        if (err) return next(err);
        books = books.map(function (book) {
          book = book.toObject();
          book.owned = true;
          return book;
        });
        res.send(books);
      });
    });
  });

  // Add a book to my collection.
  //-------------------------------
  app.post("/addBook/:book", isLoggedIn, function (req, res, next) {
    User.findById(req.user._id, function (err, user) {
      Book.findOne({ id: req.params.book }, function (err, book) {
        if (err) return next(err);
        if (!book) return res.send({ ok: false });

        var ownsBook = user.local.books.filter(function (id) {
          if (id == book.id) return true;
        }).length > 0;

        // Add the book if we dont own it yet.
        if (!ownsBook) {
          user.local.books.push(book.id);
          user.local.book_titles.push(book.title);
        }

        // Used for toggling which is impossible right now.
        /*
        else user.local.books = user.local.books.filter((id)=>{
          if(id==book.id) return false;
          else return true;
        })  */

        user.save(function (err) {
          if (err) return next(err);
          res.end();
        });
      });
    });
  });

  // Account updating. If anything changes, it is set, otherwise it stays the way it was.
  // Email adress is verified by regex, password verification is required
  app.post("/updateAccount", isLoggedIn, function (req, res, next) {
    User.findById(req.user._id, function (err, user) {
      if (req.body.email && req.body.email.match(/\w*@\w*.\w*/) == null) return res.send({ code: 11 }); // Check if our email fits the regex pattern.

      if (user.validPassword(req.body.currentpassword)) {
        // Verify password
        user.local.username = req.body.username ? req.body.username : user.local.username; // Set Username
        user.local.USERNAME = req.body.username ? req.body.username.toUpperCase() : user.local.USERNAME;

        user.local.email = req.body.email && req.body.email.match(/\w*@\w*.\w*/) ? req.body.email : user.local.email; // Set Email
        user.local.EMAIL = req.body.email && req.body.email.match(/\w*@\w*.\w*/) ? req.body.email.toUpperCase() : user.local.EMAIL;

        user.local.country = req.body.country && req.body.country ? req.body.country : user.local.country; // Set Personal Data
        user.local.city = req.body.city && req.body.city ? req.body.city : user.local.city;
        user.local.address = req.body.address && req.body.address ? req.body.address : user.local.address;

        user.local.password = req.body.newpassword ? user.generateHash(req.body.newpassword) : req.user.local.password; // Set new Password

        user.save(function (err) {
          if (err) return next(err);
          return res.send({ code: 0 });
        });
      } else {
        return res.send({ code: 10 });
      }
    });
  });

  // To logout just call logout and destroy the session-cookie.
  app.post("/logout", function (req, res) {
    req.logout();
    req.session.destroy();

    res.redirect("/");
  });

  // To sign up: Use custom passport authentication, grab the info code and act accordingly.
  app.post("/signup", function (req, res, next) {
    passport.authenticate("local-signup", function (err, user, info) {
      if (err) return next(err);
      switch (info.code) {
        case 10:
          res.end("This email address already exists in our database.");
          break;
        case 11:
          res.end("Please provide a real existing e-mail address.");
          break;
        case 0:
          res.end("Registration successful. Please check your inbox for a verification email!");
          break;
      }
    })(req, res, next);
  });

  // To log in: Use custom passport auth, grab the info code and act accordingly.
  app.post("/login", function (req, res, next) {
    passport.authenticate("local-login", function (err, user, info) {
      if (err) return next(err);
      if (info.code == 10 || info.code == 11) res.send({ user: null, message: "Wrong password / login combination" });
      if (info.code == 12) res.send({ user: null, message: "Please verify your email address before continuing" });
      if (info.code == 0) {
        req.login(user, function (err) {
          if (err) return next(err);
        });
        res.send({ user: user, message: "Logged in successfully!" });
      }
    })(req, res, next);
  });

  // Get authentication info for a user who asks for it and is authenticated.
  app.post("/checkAuth", function (req, res) {
    if (req.isAuthenticated()) {
      // Passport function to check if we are authed.
      User.findById(req.user._id, function (err, user) {
        res.send({ authed: true, user: {
            username: user.local.username,
            email: user.local.email,
            address: user.local.address,
            country: user.local.country,
            city: user.local.city
          } });
      });
    } else res.send({ authed: false });
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
}