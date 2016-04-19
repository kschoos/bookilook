var User = require("../models/users.js");
var Book = require("../models/books.js");
var EmailVerification = require("../modules/emailverification.js");
var BookSearch = require("../modules/books.js");

module.exports = function(app, passport){

  // Home page
  app.get("/", (req, res)=>{
    if(req.isAuthenticated()){
      res.render("index", { data: {authed: true, email: req.user.local.email, username: req.user.local.username}});
    }
    else
      res.render("index", { data: { authed: false, email: "" }});
  })

  // Activation route. You get sent here by the verification email.
  app.get("/activate/:code", (req, res, next)=>{
    var hash = req.params.code;
    User.findOneAndUpdate({"local.verificationHash": hash},  // Find the entry with the given hash ... 
                          {$unset: {"local.createdAt": "", "local.verificationHash": ""}, $set: {"local.verified": true}}, // ... and update it to become verified.
                          {new: true},
                          (err, user)=>{
                            console.log(user);
                            if(!user){ // If we dont know the user... 
                              res.redirect("/"); // ... send him home
                            }
                            req.login(user, (err) =>{
                              if(err) return next(err); // Other wise log him in and send him home.
                              res.redirect("/");
                            }) 
      res.end();
    });
  })


  // Book search for generally searching for books (e.g. using the upper right search bar) 
  app.post("/searchBooks/:search", (req, res, next) => BookSearch.searchBooks(req.params.search, (err, books, msg) => {
    if(err) return next(err);
    console.log(msg);
    if(!books){
      res.send([]);
    }
    res.send(books);
  }));
  

  //--------------------------------------------------------------------
  //     getMyBooks : Gets all the books in users database and returns them.
  //--------------------------------------------------------------------
  
  app.post("/myBooks", isLoggedIn, (req, res, next) => {
    User.findById(req.user._id, (err, user)=>{
      var books = BookSearch.getInfo(user.books, (err, books)=>{
        if(err) return next(err);
        res.send(books);
      });
    })   
  })

  // Account updating. If anything changes, it is set, otherwise it stays the way it was.
  // Email adress is verified by regex, password verification is required 
  app.post("/updateAccount", isLoggedIn, (req, res, next) => {
    User.findById(req.user._id, (err, user)=>{
      if(req.body.email && (req.body.email.match(/\w*@\w*.\w*/) == null)) return res.send({code: 11}); // Check if our email fits the regex pattern.

      if(user.validPassword(req.body.currentpassword)) { // Verify password
          user.local.username = req.body.username ? req.body.username : user.local.username; // Set Username
          user.local.USERNAME = req.body.username ? req.body.username.toUpperCase() : user.local.USERNAME;

          user.local.email = req.body.email && req.body.email.match(/\w*@\w*.\w*/) ? req.body.email: user.local.email; // Set Email
          user.local.EMAIL = req.body.email && req.body.email.match(/\w*@\w*.\w*/) ? req.body.email.toUpperCase() : user.local.EMAIL;

          user.local.country = req.body.country && req.body.country ? req.body.country: user.local.country; // Set Personal Data
          user.local.city = req.body.city && req.body.city ? req.body.city : user.local.city;
          user.local.address = req.body.address && req.body.address ? req.body.address : user.local.address;

          user.local.password = req.body.newpassword ? user.generateHash(req.body.newpassword) : req.user.local.password; // Set new Password
        
        user.save((err)=>{
          if(err) return next(err);
          return res.send({code: 0});
        })
      } else {
        return res.send({code: 10});
      }
    })
  })


  // To logout just call logout and destroy the session-cookie.
  app.post("/logout", (req, res)=>{
    req.logout();
    req.session.destroy();

    res.redirect("/");
  })


  // To sign up: Use custom passport authentication, grab the info code and act accordingly.
  app.post("/signup", (req, res, next) => {
    passport.authenticate("local-signup", (err, user, info) =>{
      if(err) return next(err);
      switch(info.code){
        case 10:
          res.end("This email address already exists in our database.");
          break;
        case 11:
          res.end("Please provide a real existing e-mail address.")
          break;
        case 0:
          res.end("Registration successful. Please check your inbox for a verification email!");
          break;
      }
    })(req, res, next);
  });

  // To log in: Use custom passport auth, grab the info code and act accordingly.
  app.post("/login", (req, res, next) => {
    passport.authenticate("local-login", (err, user, info) =>{
      if(err) return next(err);
      if(info.code == 10 || info.code == 11) res.send({user: null, message: "Wrong password / login combination"});
      if(info.code == 12) res.send({user: null, message: "Please verify your email address before continuing"});
      if(info.code == 0) {
        req.login(user, (err)=>{
          if(err) return next(err);
        })
        res.send({user: user, message: "Logged in successfully!"}); 
      }
    })(req, res, next);
  })

  // Get authentication info for a user who asks for it and is authenticated.
  app.post("/checkAuth", (req, res) => {
    if(req.isAuthenticated()){ // Passport function to check if we are authed.
      User.findById(req.user._id, (err, user) =>{ 
        res.send({authed: true, user: { 
                                         username: user.local.username,
                                         email: user.local.email,
                                         address: user.local.address,
                                         country: user.local.country,
                                         city: user.local.city 
        }})
      })
    }    
    else res.send({authed: false});
  })
}

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }

  res.redirect("/");
}
