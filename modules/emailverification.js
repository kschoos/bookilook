"use strict";

var EmailTemplate = require("email-templates").EmailTemplate;
var path = require("path");
var email = require("emailjs");
var sendmail = require("sendmail")();

var emailConfiguration = {
  from: "confirmyour@email.com", //Can be anything!
  subject: "Somethingsomething email verification",
  content: "This is inner text. Please click link for thingies. Yay."
};

var templateDir = path.join(__dirname, "templates", "verification-email");
var mail = new EmailTemplate(templateDir);

module.exports = function (TO, callback) {
  // TO can either be a comma seperated list of emails as a string, or an array, or a single email adress.
  if (Array.isArray(TO)) TO = TO.join(",");
  emailConfiguration.to = TO;
  sendmail(emailConfiguration, callback);
};