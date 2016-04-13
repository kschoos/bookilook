"use strict";

var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/users.js");

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use("local-signup", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  }, function (req, email, password, done) {
    process.nextTick(function () {
      User.findOne({ "local.email": email }, function (err, user) {
        if (err) return done(err);
        if (user) return done(null, false);else {
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.save(function (err) {
            if (err) throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  passport.use("local-login", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  }, function (req, email, password, done) {
    User.findOne({ "local.email": email }, function (err, user) {
      if (err) return done(err);

      if (!user) {
        console.log("You are not registered.");
        return done(null, false);
      }

      if (!user.validPassword(password)) {
        console.log("You entered a wrong password.");
        return done(null, false);
      }

      console.log("Logged in successfully!");
      return done(null, user);
    });
  }));
};