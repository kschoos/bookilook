var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var routes = require("./routes/main_routes.js");
var auth = require("./modules/auth.js")(app);

var port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "jade");

app.get("/logout", routes.isAuthenticated, routes.logout);
app.get("/", routes.home);
app.post("/search", routes.search);
app.post("/registerAt", routes.isAuthenticated, routes.registerAt);

app.listen(port, function(){
  console.log("Server listening on port " + port);
})
