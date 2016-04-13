"use strict";

$(document).ready(function () {
  ReactDOM.render(React.createElement(App, null), document.getElementById("content-inner"));
  ReactDOM.render(React.createElement(SideBar, null), document.getElementById("sidebar"));
});

var App = React.createClass({
  displayName: "App",
  render: function render() {
    return React.createElement(LoginForm, null);
  }
});

var SideBar = React.createClass({
  displayName: "SideBar",
  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(SearchBar, null),
      React.createElement("hr", null),
      function () {
        if (serverData.authed) return React.createElement(Logout, null);else return React.createElement(LoginForm, null);
      }()
    );
  }
});

var SearchBar = React.createClass({
  displayName: "SearchBar",
  render: function render() {
    return React.createElement(
      "div",
      { className: "search-bar" },
      React.createElement(
        "form",
        { action: "/search", method: "post" },
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "label",
            null,
            "Booksearch"
          ),
          React.createElement("input", { type: "text", className: "form-control", name: "booksearch" })
        ),
        React.createElement(
          "button",
          { className: "btn btn-default btn-block", type: "submit" },
          "Search!"
        )
      )
    );
  }
});

var Logout = React.createClass({
  displayName: "Logout",
  render: function render() {
    return React.createElement(
      "div",
      { className: "logout" },
      React.createElement(
        "form",
        { action: "/logout", method: "post" },
        React.createElement(
          "label",
          null,
          "Logged in as ",
          serverData.email
        ),
        React.createElement(
          "button",
          { className: "btn btn-warning btn-block", type: "submit" },
          "Logout..."
        )
      )
    );
  }
});

var LoginForm = React.createClass({
  displayName: "LoginForm",
  render: function render() {
    return React.createElement(
      "div",
      { className: "login-form" },
      React.createElement(
        "form",
        { action: "/login", method: "post" },
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "label",
            null,
            "E-Mail"
          ),
          React.createElement("input", { type: "text", className: "form-control", name: "email" })
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "label",
            null,
            "Password"
          ),
          React.createElement("input", { type: "password", className: "form-control", name: "password" })
        ),
        React.createElement("input", { type: "submit", className: "btn btn-default btn-block", value: "Login!" })
      ),
      React.createElement("hr", null),
      React.createElement(
        "p",
        null,
        "Need an account? ",
        React.createElement(
          "a",
          { href: "#" },
          "Signup!"
        )
      ),
      React.createElement(
        "p",
        null,
        "Or go ",
        React.createElement(
          "a",
          { href: "#" },
          "home"
        ),
        "."
      )
    );
  }
});

var SignupForm = React.createClass({
  displayName: "SignupForm",
  render: function render() {
    return React.createElement(
      "div",
      { className: "signup-form" },
      React.createElement(
        "form",
        { action: "/signup", method: "post" },
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "label",
            null,
            "E-Mail"
          ),
          React.createElement("input", { type: "text", className: "form-control", name: "email" })
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "label",
            null,
            "Password"
          ),
          React.createElement("input", { type: "password", className: "form-control", name: "password" })
        ),
        React.createElement("input", { type: "submit", className: "btn btn-default btn-block", value: "Sign up!" })
      ),
      React.createElement("hr", null),
      React.createElement(
        "p",
        null,
        "Or go ",
        React.createElement(
          "a",
          { href: "#" },
          "home"
        ),
        "."
      )
    );
  }
});