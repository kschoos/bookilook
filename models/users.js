var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var crypto = require("crypto");
var Nonce = require("./nonces.js");

var User = mongoose.Schema({
  local:{
    USERNAME: String,
    username: String,
    EMAIL: String,
    email: String,
    password: String,
    verificationHash: String,
    verified: Boolean,
    createdAt: {
      type: Date,
      expires: 900,
      default: Date.now
    }
  }
})

User.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

User.methods.validPassword = function(password, sessionID, cnonce, callback){
  console.log("Cnonce: " + cnonce);
  Nonce.findOne({userID: sessionID}, (err, nonce) => {
    if(err) return callback(err);
    var noncedPW = crypto.createHash("md5").update( nonce.nonce + cnonce + this.local.password ).digest("hex");
    console.log(nonce.nonce);
    return bcrypt.compareSync(password, noncedPW);
  }) 
}

module.exports = mongoose.model("User", User);
