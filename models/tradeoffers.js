var mongoose = require("mongoose");

var TradeOffer = mongoose.Schema({
  traderBookID: String,
  offeredBookTitle: String,
  tradeID: String,
  trader: String,
  offerer: String
})

module.exports = mongoose.model("TradeOffer", TradeOffer);
