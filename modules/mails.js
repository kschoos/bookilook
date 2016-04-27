"use strict";

var EmailTemplate = require("email-templates").EmailTemplate;
var path = require("path");
var nodemailer = require("nodemailer");

var smtpconfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.EMAIL_ADDR,
    pass: process.env.EMAIL_PASS
  }
};

var transporter = nodemailer.createTransport(smtpconfig);

var emailConfiguration = {
  from: "donotrespond@skusku.org",
  subject: "Bookilook trade offer!"
};

var Mails = function Mails() {};

var templateDir = "templates/trade-mail";
var mail = new EmailTemplate(templateDir);

Mails.prototype.sendTradeOffer = function (theirBookTitle, TO, myBookTitle, tradeOfferIndex, callback) {
  emailConfiguration.to = TO;
  mail.render({ theirBookTitle: theirBookTitle, myBookTitle: myBookTitle, tradeID: tradeOfferIndex }, function (err, result) {
    if (err) throw err;
    emailConfiguration.html = result.html;
    transporter.sendMail(emailConfiguration, callback);
  });
};

module.exports = new Mails();