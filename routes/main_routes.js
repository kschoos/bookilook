var mongo = require("mongodb").MongoClient;
var DB = {};

mongo.connect(process.env.MONGOLAB_URI, function(err, db){
  if(err){
    console.log(err)
    return;
  }
  console.log("Successfully connected to MongoDB");
  DB = db;
})

var Routes = function() {};

Routes.prototype.isAuthenticated = function(req, res, next){
  if(req.session.passport)
    return next();

  res.redirect("/");
}
 
Routes.prototype.home = function(req, res){
  res.render("index");
}
module.exports = new Routes();
