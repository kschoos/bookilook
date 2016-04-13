"use strict";

var express = require("express");
var passport = require("passport");
var session = require("express-session");
var app = express();
var bodyparser = require("body-parser");
var auth = require("./modules/auth.js")(app);
var mongoose = require("mongoose");

var port = process.env.PORT || 5000;

// Setup Mongodb
mongoose.connect(process.env.MONGODB_URI);
var db = mongoose.connection;
db.once("open", function () {
  console.log("Successfully connected to MongoDB");
});

require("./config/passport.js")(passport);

// Setup express
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "jade");

// Setup passport.
app.use(session({ secret: "laliluuu" }));
app.use(passport.initialize());
app.use(passport.session());

require("./routes/main_routes.js")(app, passport);

app.listen(port, function () {
  console.log("Server listening on port " + port);
});