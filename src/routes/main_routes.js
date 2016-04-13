var EmailVerification = require("../modules/emailverification.js");

module.exports = function(app, passport){

  app.get("/testmail", (req, res)=>{
    EmailVerification("rincewind1230@hotmail.com", function(err, message){
      if(err) throw err;
      console.log("Successfully send message.");
      res.render("index");
    });
  })

  app.get("/", (req, res)=>{
    if(req.isAuthenticated()){
      res.render("index", { data: {authed: true, email: req.user.local.email}});
    }
    else
      res.render("index", { data: { authed: false, email: "" }});
  })

  app.get("/login", (req, res)=>{
    res.render("index");
  })

  app.get("/profile", isLoggedIn, (req, res)=>{
    res.render("index");
  })

  app.post("/logout", (req, res)=>{
    req.logout();
    req.session.destroy();

    res.redirect("/");
  })

  app.get("/signup", (req, res)=>{
    res.render("index");
  })

  app.post("/signup", passport.authenticate("local-signup", {
    successRedirect: "/",
    failureRedirect: "/"
  }));

  app.post("/login", passport.authenticate("local-login", {
    successRedirect: "/",
    failureRedirect: "/"
  }));
}

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }

  res.redirect("/");
}
