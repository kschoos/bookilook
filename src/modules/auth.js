var passport = require("passport");
var session = require("express-session");

module.exports = function(app) {

  passport.serializeUser(function(user, done) { done(null, user); });
  passport.deserializeUser(function(user, done) { done(null, user); });

  app.use(session({secret: "laliluuu"}));
  app.use(passport.initialize());
  app.use(passport.session())
};
