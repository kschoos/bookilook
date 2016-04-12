var passport = require("passport");
var session = require("express-session");
var TwitterStrategy = require("passport-twitter").Strategy;

module.exports = function(app) {
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL
  },function(accessToken, refreshToken, profile, done){
    process.nextTick(function(){
      return done(null, profile);
    })
  }))

  passport.serializeUser(function(user, done) { done(null, user); });
  passport.deserializeUser(function(user, done) { done(null, user); });

  app.use(session({secret: "laliluuu"}));
  app.use(passport.initialize());
  app.use(passport.session())

  app.get("/auth/twitter", passport.authenticate("twitter"), function(req, res){})
  app.get("/auth/callback", passport.authenticate("twitter", { failureRedirect: "/" }), function(req, res){ res.redirect("/"); })
};
