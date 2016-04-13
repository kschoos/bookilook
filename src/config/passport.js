var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/users.js");

module.exports = function(passport){
  passport.serializeUser((user, done)=>{
    done(null, user.id);
  }) 

  passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=>{
      done(err, user);
    })
  })

  passport.use("local-signup", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  }, (req, email, password, done)=>{
    process.nextTick(()=>{
      User.findOne({"local.email": email}, (err, user)=>{
        if(err)
          return done(err);
        if(user)
          return done(null, false);
        else {
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.save((err)=>{
            if(err) throw err;
            return done(null, newUser);
          })
        }
        
      })
    })
  }))


  passport.use("local-login", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  }, (req, email, password, done)=>{
    User.findOne({ "local.email": email }, (err, user)=>{
      if(err)
        return done(err);

      if(!user){
        console.log("You are not registered.");
        return done(null, false);
      }

      if(!user.validPassword(password)){
        console.log("You entered a wrong password.");
        return done(null, false);
      }

      console.log("Logged in successfully!");
      return done(null, user);
    })
  }))
}
