var mongoose = require("mongoose");
var crypto = require("crypto");
var secret = process.env.NONCE_SECRET;

var Nonce = mongoose.Schema({
  userID: String,
  nonce: String,
  nonceExpiration: {
    type: Date,
    expires: 10,
    default: Date.now
  }
})

Nonce.methods.generateNonce = (salt) => {
  var md5 = crypto.createHash("md5");
  return md5.update(salt + Date.now()).digest("hex");
}

module.exports = mongoose.model("Nonce", Nonce);
