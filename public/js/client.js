"use strict";

$(document).ready(function () {
  ReactDOM.render(React.createElement(App, null), document.getElementById("wrapper"));
});

// App : Ties everything together.
// -----------------------------------------------
// App
// - Header
// - Body

var App = React.createClass({
  displayName: "App",

  childContextTypes: {
    user: React.PropTypes.object,
    authed: React.PropTypes.bool,
    checkAuth: React.PropTypes.func,
    setPage: React.PropTypes.func
  },
  getChildContext: function getChildContext() {
    return {
      user: this.state.user,
      authed: this.state.authed,
      checkAuth: this.checkAuth,
      setPage: this.setPage
    };
  },
  getInitialState: function getInitialState() {
    return {
      authed: false,
      currentPage: "",
      bookdata: {},
      user: {}
    };
  },
  componentWillMount: function componentWillMount() {
    this.checkAuth();
  },
  setPage: function setPage(page, bookdata) {
    this.setState({ currentPage: page, bookdata: bookdata });
  },
  checkAuth: function checkAuth() {
    var that = this;

    $.ajax({
      url: "/checkAuth",
      type: "post",
      success: function success(data) {
        that.setState({ authed: data.authed, user: data.user });
      }
    });
  },
  render: function render() {
    return React.createElement(
      "div",
      { className: "app" },
      React.createElement(Header, null),
      React.createElement(Body, { page: this.state.currentPage, singleBookData: this.state.bookdata })
    );
  }
});

// -----------------------------------------------
// The parts of the app.
// -----------------------------------------------

// Header
// -----------------------------------------------
// - Navbar

var Header = React.createClass({
  displayName: "Header",
  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { id: "header", className: "row" },
        React.createElement("div", { className: "col-md-1" }),
        React.createElement(
          "div",
          { className: "col-md-11 col-xs-12" },
          React.createElement(Navbar, null)
        )
      ),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col-xs-12 hidden-md-up" },
          React.createElement(SideBar, { sidebarID: 0 })
        )
      )
    );
  }
});

// Body - Modified by props.page
// -----------------------------------------------
// - Main Content
// - Sidebar

var Body = React.createClass({
  displayName: "Body",
  getInitialState: function getInitialState() {
    return {
      lastSearch: ""
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (/searchBooks\//.test(nextProps.page)) {
      this.setState({ lastSearch: nextProps.page });
    }
  },
  render: function render() {
    var _this = this;

    return React.createElement(
      "div",
      { id: "content", className: "row" },
      React.createElement("div", { className: "col-md-1" }),
      React.createElement(
        "div",
        { id: "content-inner", className: "col-md-8 col-sm-11" },
        React.createElement(SignupModal, null),
        function () {
          var page = _this.props.page;
          switch (true) {
            case /AccountSettings/.test(page):
              return React.createElement(AccountSettings, null);
              break;
            case /myBooks/.test(page):
              return React.createElement(BookShelf, { books: "myBooks" });
              break;
            case /searchBooks\/.*/.test(page):
              return React.createElement(BookShelf, { books: _this.props.page });
              break;
            case /^Book$/.test(page):
              return React.createElement(BookPage, { data: _this.props.singleBookData, lastSearch: _this.state.lastSearch });
              break;
          }
        }()
      ),
      React.createElement(
        "div",
        { id: "sidebar", className: "col-md-3 hidden-sm-down" },
        React.createElement(SideBar, { sidebarID: 1 })
      )
    );
  }
});

// Sidebar
// -----------------------------------------------
// - * Logout
// - * LoginForm

var SideBar = React.createClass({
  displayName: "SideBar",

  contextTypes: {
    authed: React.PropTypes.bool
  },
  render: function render() {
    var _this2 = this;

    return React.createElement(
      "div",
      null,
      React.createElement(SearchBar, null),
      React.createElement("hr", null),
      function () {
        if (_this2.context.authed) return React.createElement(Logout, null);else return React.createElement(LoginForm, { formID: _this2.props.sidebarID });
      }()
    );
  }
});

// Navbar
// -----------------------------------------------
// The upper navigation bar - standard bootstrap navbar.

var Navbar = React.createClass({
  displayName: "Navbar",
  render: function render() {
    return React.createElement(
      "nav",
      { className: "navbar navbar-light bg-faded" },
      React.createElement(
        "a",
        { className: "navbar-brand" },
        "Bookilook"
      ),
      React.createElement("ul", { className: "nav navbar-nav pull-xs-right" })
    );
  }
});

// SearchBar
// -----------------------------------------------
// The upper right search bar - search for books.
// POSTS: /search
// DATA: booksearch ( search query )

var SearchBar = React.createClass({
  displayName: "SearchBar",
  getInitialState: function getInitialState() {
    return {
      searchStatus: "All"
    };
  },

  contextTypes: {
    setPage: React.PropTypes.func
  },
  search: function search(e) {
    e.preventDefault();
    this.context.setPage("searchBooks/" + e.target[0].value);
  },
  toggleSearch: function toggleSearch(value) {
    if (value) this.setState({ searchStatus: "All" });else this.setState({ searchStatus: "Trade" });
  },
  render: function render() {
    return React.createElement(
      "div",
      { className: "search-bar" },
      React.createElement(
        "form",
        { onSubmit: this.search },
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
        React.createElement(SliderButton, { toggle: this.toggleSearch, right: "All", left: "Trade", size: 30, gap: 2 }),
        React.createElement(
          "button",
          { className: "btn btn-default btn-block search-button", type: "submit" },
          "Search!"
        )
      )
    );
  }
});

// Logout
// -----------------------------------------------
// Username and logout button shown when logged in.
// Uses context data to show user data.

var Logout = React.createClass({
  displayName: "Logout",

  contextTypes: {
    authed: React.PropTypes.bool,
    user: React.PropTypes.object,
    setPage: React.PropTypes.func
  },
  showUser: function showUser() {
    this.context.setPage("AccountSettings");
  },
  showMyBooks: function showMyBooks() {
    this.context.setPage("myBooks");
  },
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
          React.createElement(
            "a",
            { href: "#", onClick: this.showUser },
            " ",
            this.context.user.username ? this.context.user.username : this.context.user.email
          )
        ),
        React.createElement(
          "button",
          { className: "btn btn-warning btn-block", type: "submit" },
          "Logout..."
        )
      ),
      React.createElement("hr", null),
      React.createElement(
        "button",
        { className: "btn btn-default btn-block", onClick: this.showMyBooks },
        "My Books"
      )
    );
  }
});

// AccountSettings
// -----------------------------------------------
// Displayed in Main Content. Shows user information and enables the user to change it
// POST: /updateAccount ( updates the account with provided info )
// DATA: provided user information ( (username || email || newpassword || country || city ) && currentpassword )
// requires password verification

var AccountSettings = React.createClass({
  displayName: "AccountSettings",

  contextTypes: {
    user: React.PropTypes.object,
    checkAuth: React.PropTypes.func
  },
  getInitialState: function getInitialState() {
    return {
      alerttype: "",
      alerttext: ""
    };
  },
  updateAccount: function updateAccount(e) {
    e.preventDefault();
    var that = this;

    var data = {
      username: e.target[0].value,
      email: e.target[1].value,
      newpassword: e.target[2].value,
      country: e.target[3].value,
      city: e.target[4].value,
      address: e.target[5].value,
      currentpassword: e.target[6].value
    };

    $.ajax({
      url: "/updateAccount",
      type: "post",
      data: data,
      success: function success(response) {
        that.context.checkAuth();
        if (response.code == 0) that.setState({
          alerttype: "success",
          alerttext: "Data updated successfully!",
          emailvalidation: data.email ? "has-success" : "",
          passwordvalidation: "has-success"
        });

        if (response.code == 10) {
          that.setState({ alerttype: "danger",
            alerttext: "Please enter your correct current password!",
            passwordvalidation: "has-danger" });
        }
        if (response.code == 11) that.setState({ alerttype: "danger",
          alerttext: "Please enter a valid email-address.",
          emailvalidation: "has-danger" });
      }
    });
  },
  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "accountSettings" },
        React.createElement(
          "form",
          { onSubmit: this.updateAccount },
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              { htmlFor: "username" },
              "Username"
            ),
            React.createElement("input", { type: "text", name: "username", className: "form-control", placeholder: this.context.user.username ? this.context.user.username : "Username" }),
            React.createElement(
              "div",
              { className: "form-group " + this.state.emailvalidation },
              React.createElement(
                "label",
                { className: "form-control-label", htmlFor: "email" },
                "Email"
              ),
              React.createElement("input", { type: "text", name: "email", className: "form-control", placeholder: this.context.user.email })
            ),
            React.createElement(
              "label",
              { htmlFor: "newpassword" },
              "New Password"
            ),
            React.createElement("input", { type: "password", className: "form-control", name: "newpassword" }),
            React.createElement("hr", null),
            React.createElement(
              "label",
              { htmlFor: "country" },
              "Country"
            ),
            React.createElement("input", { type: "text", name: "country", className: "form-control", placeholder: this.context.user.country ? this.context.user.country : "Country" }),
            React.createElement(
              "label",
              { htmlFor: "city" },
              "City"
            ),
            React.createElement("input", { type: "text", name: "city", className: "form-control", placeholder: this.context.user.city ? this.context.user.city : "City" }),
            React.createElement(
              "label",
              { htmlFor: "address" },
              "Address"
            ),
            React.createElement("input", { type: "text", name: "address", className: "form-control", placeholder: this.context.user.address ? this.context.user.address : "Address" }),
            React.createElement(
              "div",
              { className: "form-group " + this.state.passwordvalidation },
              React.createElement(
                "label",
                { className: "form-control-label", htmlFor: "currentpassword" },
                "Current Password"
              ),
              React.createElement("input", { type: "password", className: "form-control ", name: "currentpassword" })
            ),
            React.createElement("hr", null),
            React.createElement(
              "button",
              { type: "submit", className: "btn btn-block btn-default btn-warning" },
              "Submit"
            ),
            React.createElement("hr", null),
            React.createElement(
              "div",
              { className: "alert alert-" + this.state.alerttype },
              this.state.alerttext
            )
          )
        )
      )
    );
  }
});

//  LoginForm
// -----------------------------------------------
// Used to log in with your credentials
// POST: /login
// DATA: (email || username) && password

var LoginForm = React.createClass({
  displayName: "LoginForm",
  getInitialState: function getInitialState() {
    return {
      message: ""
    };
  },

  contextTypes: {
    checkAuth: React.PropTypes.func
  },
  submitForm: function submitForm(e) {
    e.preventDefault();
    var data = {
      email: e.target[0].value,
      password: e.target[1].value
    };

    if (!data.email || !data.password) that.setMessage("Please provide a login and password.");
    var that = this;

    $.ajax({
      url: "/login",
      type: "post",
      data: data,
      success: function success(data) {
        that.setMessage(data.message);
        that.context.checkAuth();
      }
    });
  },
  setMessage: function setMessage(message) {
    this.setState({ message: message });
  },
  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "login-form collapse", id: "login-form" + this.props.formID },
        React.createElement(
          "form",
          { id: "login-form-form", onSubmit: this.submitForm },
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              { htmlFor: "email" },
              "E-Mail / Username"
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
        React.createElement(
          "p",
          null,
          this.state.message
        ),
        React.createElement("hr", null),
        React.createElement(
          "p",
          null,
          "Need an account? ",
          React.createElement(
            "a",
            { "data-toggle": "modal", "data-target": "#signupModal" },
            "Signup!"
          )
        )
      ),
      React.createElement(
        "button",
        { className: "btn btn-primary btn-block login-collapse-button", type: "button", "data-toggle": "collapse", "data-target": "#login-form" + this.props.formID, "aria-expanded": "false", "aria-controls": "login-form" + this.props.formID },
        React.createElement("i", { className: "fa fa-sign-in", "aria-hidden": "true" })
      )
    );
  }
});

// SignupModal
// -----------------------------------------------
// - SignupForm
//
// Modal that pops up when you click the Signup link

var SignupModal = React.createClass({
  displayName: "SignupModal",
  getInitialState: function getInitialState() {
    return {
      message: ""
    };
  },
  setMessage: function setMessage(message) {
    this.setState({ message: message });
  },
  render: function render() {
    return React.createElement(
      "div",
      { className: "modal fade", id: "signupModal", tabIndex: "-1", role: "dialog", "aria-labelledby": "signupModalTitle", "aria-hidden": "true" },
      React.createElement(
        "div",
        { className: "modal-dialog", role: "document" },
        React.createElement(
          "div",
          { className: "modal-content" },
          React.createElement(
            "div",
            { className: "modal-header" },
            React.createElement(
              "button",
              { type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close" },
              React.createElement(
                "span",
                { "aria-hidden": "true" },
                "×"
              )
            ),
            React.createElement(
              "h4",
              { className: "modal-title", id: "signupModalTitle" },
              "Signup now!"
            )
          ),
          React.createElement(
            "div",
            { className: "modal-body" },
            React.createElement(SignupForm, { setMessage: this.setMessage }),
            React.createElement(
              "button",
              { className: "btn btn-block btn-default", "data-toggle": "modal", "data-target": "#signupModal" },
              "Close"
            )
          ),
          React.createElement(
            "div",
            { className: "modal-footer" },
            this.state.message
          )
        )
      )
    );
  }
});

//  SignupForm
// -----------------------------------------------
// Used to sign up with the site.
// POST: /signup
// DATA: email && password

var SignupForm = React.createClass({
  displayName: "SignupForm",
  componentDidMount: function componentDidMount() {
    $("#signup-form-form").submit(function (e) {
      e.preventDefault();
      var data = {
        email: e.target[0].value,
        password: e.target[1].value
      };

      var setMessage = this.props.setMessage;

      if (data.email.indexOf("hotmail") > -1) {
        setMessage("Sorry, Hotmail addresses are currently not supported :(");
        return;
      }

      $.ajax({
        url: "/signup",
        type: "post",
        data: data,
        success: function success(data) {
          setMessage(data);
        }
      });
    }.bind(this));
  },
  render: function render() {
    return React.createElement(
      "div",
      { className: "signup-form" },
      React.createElement(
        "form",
        { id: "signup-form-form" },
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
      )
    );
  }
});

// Book
// -----------------------------------------------
// Self explanatory eh?

var Book = React.createClass({
  displayName: "Book",

  contextTypes: {
    setPage: React.PropTypes.func
  },
  getInitialState: function getInitialState() {
    return {
      open: false,
      bookstyle: {}
    };
  },
  openBook: function openBook() {
    this.context.setPage("Book", this.props.data);
    return false;
  },
  render: function render() {
    return React.createElement(
      "div",
      { className: "book card", style: this.state.bookstyle, onClick: this.openBook },
      React.createElement(
        "a",
        { href: "#", onClick: this.openBook },
        React.createElement("img", { className: "img-fluid center-block", src: this.props.data.thumbnail, alt: this.props.data.title })
      ),
      React.createElement(
        "div",
        { className: "card-block" },
        React.createElement(
          "h4",
          { className: "card-title" },
          this.props.data.title
        )
      )
    );
  }
});

// BookShelf
// -----------------------------------------------
// Shows the queried books

var BookShelf = React.createClass({
  displayName: "BookShelf",
  getInitialState: function getInitialState() {
    return {
      loaded: false,
      books: []
    };
  },
  componentWillMount: function componentWillMount() {
    this.getBooks(this.props.books);
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.getBooks(nextProps.books);
    this.setState({ loaded: false });
  },
  getBooks: function getBooks(route) {
    var that = this;

    $.ajax({
      url: "/" + route,
      type: "post",
      success: function success(books) {
        that.setState({ loaded: true, books: books });
      }
    });
  },
  render: function render() {
    if (!this.state.loaded) return React.createElement(
      "div",
      { className: "loading-screen" },
      React.createElement("i", { className: "fa fa-cog fa-spin fa-3x fa-fw", "aria-hidden": "true" }),
      React.createElement(
        "span",
        { className: "sr-only" },
        "Loading..."
      )
    );

    return React.createElement(
      "div",
      { id: "book-shelf", className: "book-shelf card-columns" },
      this.state.books.map(function (book, i) {
        return React.createElement(Book, { data: book, key: i });
      })
    );
  }
});

// BookPage
// -----------------------------------------------
// Shows the details of the book when a book is clicked.

var BookPage = React.createClass({
  displayName: "BookPage",
  getInitialState: function getInitialState() {
    console.log(this.props.data);
    return {
      isOwned: this.props.data.owned
    };
  },

  contextTypes: {
    setPage: React.PropTypes.func,
    authed: React.PropTypes.bool
  },
  goToLastSearch: function goToLastSearch() {
    console.log(this.props.lastSearch);
    this.context.setPage(this.props.lastSearch);
  },
  render: function render() {
    console.log(this.context);
    return React.createElement(
      "div",
      { className: "book-page" },
      React.createElement(
        "div",
        { className: "book-page-header row" },
        React.createElement(
          "div",
          { className: "col-xs-12" },
          React.createElement(
            "button",
            { className: "btn btn-warning btn-block", onClick: this.goToLastSearch },
            React.createElement("i", { className: "fa fa-arrow-circle-left" }),
            " Back to my search results."
          )
        )
      ),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col-xs-4" },
          React.createElement("img", { src: this.props.data.thumbnail })
        ),
        React.createElement(
          "div",
          { className: "col-xs-4" },
          React.createElement(BookPageButtons, { owned: this.props.data.owned, bookID: this.props.data.id })
        )
      ),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col-xs-12" },
          React.createElement(
            "h2",
            { className: "title" },
            this.props.data.title
          ),
          React.createElement(
            "h4",
            null,
            "Description:"
          ),
          React.createElement("p", { dangerouslySetInnerHTML: { __html: this.props.data.description || "Sorry, could not find any description..." } })
        )
      ),
      React.createElement(
        "div",
        { className: "book-page-footer row" },
        React.createElement("div", { className: "col-xs-12" })
      )
    );
  }
});

// BookPageButtons
// Buttons that are shown when logged in and on a Book Page
//-----------------------------------------------------------

var BookPageButtons = React.createClass({
  displayName: "BookPageButtons",

  contextTypes: {
    authed: React.PropTypes.bool
  },
  getInitialState: function getInitialState() {
    return {
      owned: this.props.owned
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({ owned: nextProps.owned });
  },
  toggleOwn: function toggleOwn() {
    this.setState({ owned: !this.state.owned });
    var that = this;
    $.ajax({
      type: "post",
      url: "/addBook/" + this.props.bookID
    });
  },
  render: function render() {
    switch (this.context.authed) {
      case true:
        switch (this.state.owned) {
          case true:
            return React.createElement(
              "div",
              { className: "bookPageButtons" },
              React.createElement(
                "div",
                { className: "card card-inverse card-success text-xs-center" },
                React.createElement(
                  "div",
                  { className: "card-block" },
                  React.createElement(
                    "p",
                    { className: "card-text" },
                    "I own this book."
                  )
                )
              ),
              React.createElement(
                "button",
                { className: "btn btn-default btn-block" },
                "Offer Trade."
              )
            );
          case false:
            return React.createElement(
              "div",
              { className: "bookPageButtons" },
              React.createElement(
                "button",
                { className: "btn btn-default btn-block", onClick: this.toggleOwn },
                "I have this book!"
              )
            );
        }

      case false:
        return React.createElement("p", null);
    }
  }
});

// Slider Button
//----------------

var SliderButton = React.createClass({
  displayName: "SliderButton",
  getInitialState: function getInitialState() {
    return {
      left: false
    };
  },
  containerStyle: function containerStyle() {
    return {
      justifyContent: "space-around",
      display: "inline-flex",
      width: "100%",
      outline: "none"
    };
  },
  buttonContainerStyle: function buttonContainerStyle() {
    var size = this.props.size;
    return {
      position: "relative",
      height: size,
      width: size * 2
    };
  },
  leftPartStyle: function leftPartStyle() {
    var size = this.props.size * 1;
    return {
      backgroundColor: "#337ab7",
      borderTopLeftRadius: 50,
      borderBottomLeftRadius: 50,
      width: size,
      height: size,
      position: "absolute"
    };
  },
  rightPartStyle: function rightPartStyle() {
    var size = this.props.size * 1;
    var gap = this.props.gap * 1;
    return {
      backgroundColor: "#337ab7",
      borderTopRightRadius: 50,
      borderBottomRightRadius: 50,
      width: size,
      height: size,
      position: "absolute",
      left: size
    };
  },
  buttonStyle: function buttonStyle() {
    var size = this.props.size * 1;
    var gap = this.props.gap * 1;
    return {
      backgroundColor: "white",
      position: "absolute",
      zIndex: 1,
      borderRadius: 50,
      top: gap,
      width: size - gap * 2,
      height: size - gap * 2,
      transition: "0.2s"
    };
  },
  buttonLeftStyle: function buttonLeftStyle() {
    var gap = this.props.gap * 1;
    return {
      left: gap
    };
  },
  buttonRightStyle: function buttonRightStyle() {
    var size = this.props.size * 1;
    var gap = this.props.gap * 1;
    return {
      left: size + gap
    };
  },
  toggleButton: function toggleButton() {
    var left = this.state.left;
    this.props.toggle(left);
    this.setState({ left: !left });
  },
  render: function render() {
    return React.createElement(
      "div",
      { tabIndex: "0", role: "button", className: "slider-button", "aria-label": "Toggle between searching Everything and Trades-Only", style: this.containerStyle(), onClick: this.toggleButton },
      React.createElement(
        "div",
        null,
        this.props.left
      ),
      React.createElement(
        "div",
        { style: this.buttonContainerStyle() },
        React.createElement("div", { style: this.leftPartStyle() }),
        React.createElement("div", { style: this.rightPartStyle() }),
        React.createElement("div", { style: $.extend({}, this.buttonStyle(), this.state.left ? this.buttonLeftStyle() : this.buttonRightStyle()) })
      ),
      React.createElement(
        "div",
        null,
        this.props.right,
        " "
      )
    );
  }
});