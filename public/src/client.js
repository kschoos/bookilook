$(document).ready(function(){
  ReactDOM.render(
    <App/>,
    document.getElementById("wrapper")
  );
})


// App : Ties everything together.
// -----------------------------------------------
// App
// - Header
// - Body

var App = React.createClass({
  childContextTypes:{
    user: React.PropTypes.object,
    authed: React.PropTypes.bool,
    checkAuth: React.PropTypes.func,
    setPage: React.PropTypes.func
  },
  getChildContext(){
    return {
      user: this.state.user,
      authed: this.state.authed,
      checkAuth: this.checkAuth,
      setPage: this.setPage
    }
  },
  getInitialState(){
    return{
      authed: false,
      currentPage: "",
      bookdata: {},
      user: {}
    }
  },
  componentWillMount(){
    this.checkAuth();
  },
  setPage(page, bookdata){
    this.setState({currentPage: page, bookdata: bookdata}) 
  },
  checkAuth(){
    var that = this;

    $.ajax({
      url: "/checkAuth",
      type: "post",
      success(data){
        that.setState({authed: data.authed, user: data.user});
      }
    })
  },
  render(){
    return(
      <div className="app">
        <Header/>
        <Body page={ this.state.currentPage } singleBookData={this.state.bookdata} />
      </div>
    )
  }
})

// -----------------------------------------------
// The parts of the app.
// -----------------------------------------------

// Header 
// -----------------------------------------------
// - Navbar 

var Header = React.createClass({
  render(){
    return(
      <div>
        <div id="header" className="row">
          <div className="col-md-1"></div>
          <div className="col-md-11 col-xs-12">
            <Navbar/> 
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 hidden-md-up">
            <SideBar sidebarID={ 0 }/>
          </div>
        </div>
      </div>
    )
  }
})

// Body - Modified by props.page
// -----------------------------------------------
// - Main Content
// - Sidebar

var Body = React.createClass({
  getInitialState(){
    return{
    lastSearch: ""
    }
  },
  componentWillReceiveProps(nextProps){
    if((/searchBooks\//).test(nextProps.page)){ 
      this.setState({lastSearch: nextProps.page});
    }
  },
  render(){
    return(
      <div id="content" className="row">
        <div className="col-md-1"></div>
        <div id="content-inner" className="col-md-8 col-sm-11">
          <SignupModal/> 
          {(()=>{
            var page = this.props.page;
            switch(true){
              case (/AccountSettings/).test(page):
                  return <AccountSettings/>
                break;
              case (/myBooks/).test(page):
                  return <BookShelf books="myBooks"/>
                break;
              case (/searchBooks\/.*/).test(page):
                  return <BookShelf books={ this.props.page }/>
                break;  
              case (/^Book$/).test(page):
                  return <BookPage data={ this.props.singleBookData } lastSearch={ this.state.lastSearch }/>
                break;
            }
          })()
          }
        </div>
        <div id="sidebar" className="col-md-3 hidden-sm-down">
          <SideBar sidebarID={ 1 }/> 
        </div>
      </div>
    )
  }
})

// Sidebar
// -----------------------------------------------
// - * Logout
// - * LoginForm

var SideBar = React.createClass({
  contextTypes: {
    authed: React.PropTypes.bool
  },
  render(){
    return(
      <div>
        <SearchBar/>
        <hr/>
        {(()=>{
          if(this.context.authed) return <Logout/>;
          else return <LoginForm formID={ this.props.sidebarID }/>;
        })()
        }
      </div>
    )
  }
})


// Navbar
// -----------------------------------------------
// The upper navigation bar - standard bootstrap navbar.

var Navbar = React.createClass({
  render(){
    return(
      <nav className="navbar navbar-light bg-faded">
        <a className="navbar-brand">Bookilook</a>
        <ul className="nav navbar-nav pull-xs-right">
        </ul>
      </nav>
    )
  }
});

// SearchBar
// -----------------------------------------------
// The upper right search bar - search for books.
// POSTS: /search
// DATA: booksearch ( search query )


var SearchBar = React.createClass({
  getInitialState(){
    return{
      searchStatus: "All" 
    }
  },
  contextTypes:{
    setPage: React.PropTypes.func 
  },
  search(e){
    e.preventDefault();
    this.context.setPage("searchBooks/"+e.target[0].value);
  },
  toggleSearch(value){
    if(value) this.setState({searchStatus: "All"})
    else this.setState({searchStatus: "Trade"})
  },
  render(){
    return(
      <div className="search-bar">
        <form onSubmit={ this.search }>
          <div className="form-group">
            <label>Booksearch</label>
            <input type="text" className="form-control" name="booksearch"/>
          </div>
            <SliderButton toggle={ this.toggleSearch } right="All" left="Trade" size={ 30 } gap={ 2 }/>
          <button className="btn btn-default btn-block search-button" type="submit">Search!</button>
        </form> 
      </div>
    )
  }
}) 

// Logout
// -----------------------------------------------
// Username and logout button shown when logged in.
// Uses context data to show user data.

var Logout = React.createClass({
  contextTypes: {
    authed: React.PropTypes.bool,
    user: React.PropTypes.object,
    setPage: React.PropTypes.func
  },
  showUser(){
    this.context.setPage("AccountSettings");
  },
  showMyBooks(){
    this.context.setPage("myBooks");
  },
  render(){
    return(
      <div className="logout">
        <form action="/logout" method="post">
          <label>Logged in as <a href="#" onClick={ this.showUser }> {( this.context.user.username ? this.context.user.username : this.context.user.email )}</a></label>
          <button className="btn btn-warning btn-block" type="submit">Logout...</button>
        </form>
        <hr/>
        <button className="btn btn-default btn-block" onClick={ this.showMyBooks }>My Books</button>
      </div> 
    )
  }
})

// AccountSettings
// -----------------------------------------------
// Displayed in Main Content. Shows user information and enables the user to change it
// POST: /updateAccount ( updates the account with provided info )
// DATA: provided user information ( (username || email || newpassword || country || city ) && currentpassword )
// requires password verification

var AccountSettings = React.createClass({
  contextTypes:{
    user: React.PropTypes.object,
    checkAuth: React.PropTypes.func
  },
  getInitialState(){
    return{
      alerttype: "",
      alerttext: ""
    }
  },
  updateAccount(e){
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
    }

    $.ajax({
      url: "/updateAccount",
      type: "post",
      data: data,
      success(response){
        that.context.checkAuth();
        if(response.code == 0) that.setState({
          alerttype: "success",
          alerttext: "Data updated successfully!",
          emailvalidation: data.email ? "has-success" : "",
          passwordvalidation: "has-success"
        });

        if(response.code == 10){ that.setState({alerttype: "danger",
                                          alerttext: "Please enter your correct current password!",
                                          passwordvalidation: "has-danger"});
      }
        if(response.code == 11) that.setState({alerttype: "danger",
                                          alerttext: "Please enter a valid email-address.",
                                          emailvalidation: "has-danger"}); 
      }
    })
  },
  render(){
    return(
      <div>
        <div className="accountSettings">
          <form onSubmit={ this.updateAccount }>
            <div className="form-group">

              { /* Account Stuff */ }
              <label htmlFor="username">Username</label>
              <input type="text" name="username" className="form-control" placeholder={(this.context.user.username ? this.context.user.username : "Username")}/>
              <div className={ "form-group " + this.state.emailvalidation }>
                <label className="form-control-label" htmlFor="email">Email</label>
                <input type="text" name="email" className="form-control" placeholder={ this.context.user.email }/>
              </div>
              <label htmlFor="newpassword">New Password</label>
              <input type="password" className="form-control" name="newpassword"/>
              <hr/>

              { /*  Personal Data */ }
              <label htmlFor="country">Country</label>
              <input type="text" name="country" className="form-control" placeholder={(this.context.user.country ? this.context.user.country : "Country")}/>

              <label htmlFor="city">City</label>
              <input type="text" name="city" className="form-control" placeholder={(this.context.user.city ? this.context.user.city : "City")}/>

              <label htmlFor="address">Address</label>
              <input type="text" name="address" className="form-control" placeholder={(this.context.user.address ? this.context.user.address : "Address")}/>

              { /* Password verification */ }
              <div className={ "form-group " + this.state.passwordvalidation }>
                <label className="form-control-label" htmlFor="currentpassword">Current Password</label>
                <input type="password" className="form-control " name="currentpassword"/>
              </div>
              <hr/>
              <button type="submit" className="btn btn-block btn-default btn-warning">Submit</button>
              <hr/>
              <div className={ "alert alert-" + this.state.alerttype }>{ this.state.alerttext }</div>
            </div>
        </form>
      </div>
    </div>
    )
  }
})

//  LoginForm
// -----------------------------------------------
// Used to log in with your credentials
// POST: /login
// DATA: (email || username) && password

var LoginForm = React.createClass({
  getInitialState(){
    return{
      message: ""
    }
  },
  contextTypes: {
    checkAuth: React.PropTypes.func
  },
  submitForm(e){
    e.preventDefault();
    var data = {
      email: e.target[0].value,
      password: e.target[1].value
    }

    if(!data.email || !data.password) that.setMessage("Please provide a login and password.");
    var that = this;

    $.ajax({
      url: "/login",
      type: "post",
      data: data,
      success(data){
        that.setMessage(data.message);
        that.context.checkAuth();
      }
    })
  },
  setMessage(message){
    this.setState({message: message});
  },
  render(){
    return(
      <div>
        <div className="login-form collapse" id={ "login-form" + this.props.formID }>
          <form id="login-form-form" onSubmit= { this.submitForm }>
            <div className="form-group">
              <label htmlFor="email">E-Mail / Username</label>
              <input type="text" className="form-control" name="email"/>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" name="password"/>
            </div>
            <input type="submit" className="btn btn-default btn-block" value="Login!"/>
          </form>
          <p>{ this.state.message }</p>
          <hr/>
          <p>Need an account? <a data-toggle="modal" data-target="#signupModal">Signup!</a></p>
        </div>
        <button className="btn btn-primary btn-block login-collapse-button" type="button" data-toggle="collapse" data-target={ "#login-form"+ this.props.formID } aria-expanded="false" aria-controls= { "login-form" + this.props.formID } >
           <i className="fa fa-sign-in" aria-hidden="true"></i>
        </button>
      </div>
    )
  }
})

// SignupModal
// -----------------------------------------------
// - SignupForm
//
// Modal that pops up when you click the Signup link


var SignupModal = React.createClass({
  getInitialState(){
    return{
      message: ""
    }
  },
  setMessage(message){
    this.setState({message: message})
  },
  render()
  {
    return(
      <div className="modal fade" id="signupModal" tabIndex="-1" role="dialog" aria-labelledby="signupModalTitle" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title" id="signupModalTitle">Signup now!</h4>
            </div>
            <div className="modal-body">
              <SignupForm setMessage={ this.setMessage }/>
              <button className="btn btn-block btn-default" data-toggle="modal" data-target="#signupModal">Close</button>
            </div>
            <div className="modal-footer">
              { this.state.message }
            </div>
          </div>
        </div>
      </div>
    )
  }
})

//  SignupForm
// -----------------------------------------------
// Used to sign up with the site.
// POST: /signup
// DATA: email && password


var SignupForm = React.createClass({
  componentDidMount(){
    $("#signup-form-form").submit(function(e){
      e.preventDefault();
      var data = {
        email: e.target[0].value,
        password: e.target[1].value
      }
      
      var setMessage = this.props.setMessage;

      if(data.email.indexOf("hotmail") > -1){
        setMessage("Sorry, Hotmail addresses are currently not supported :(");
        return;
      }

      $.ajax({
        url: "/signup",
        type: "post",
        data: data,
        success(data){
          setMessage(data);
        }
      })
    }.bind(this));
  },
  render(){
    return(
      <div className="signup-form">
        <form id="signup-form-form">
          <div className="form-group">
            <label>E-Mail</label>
            <input type="text" className="form-control" name="email"/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" name="password"/>
          </div>
          <input type="submit" className="btn btn-default btn-block" value="Sign up!"/>
        </form>
      </div>
    )
  }
})

// Book
// -----------------------------------------------
// Self explanatory eh?

var Book = React.createClass({
  contextTypes:{
    setPage: React.PropTypes.func
  },
  getInitialState(){
    return {
      open: false,
      bookstyle: {}
    } 
  },
  openBook(){
    this.context.setPage("Book", this.props.data);
    return false
  },
  render(){
    return(
      <div className="book card" style={ this.state.bookstyle } onClick={ this.openBook }>
        <a href="#" onClick={ this.openBook }>
          <img className="img-fluid center-block" src={ this.props.data.thumbnail } alt={ this.props.data.title } />
        </a>
        <div className="card-block">
          <h4 className="card-title">{ this.props.data.title }</h4>
        </div>
      </div>
    )
  }
})

// BookShelf
// -----------------------------------------------
// Shows the queried books

var BookShelf = React.createClass({
  getInitialState(){
    return{
      loaded: false,
      books: []
    }
  },
  componentWillMount(){
    this.getBooks(this.props.books);
  },
  componentWillReceiveProps(nextProps){
    this.getBooks(nextProps.books);
    this.setState({loaded: false});
  },
  getBooks(route){
    var that = this;

    $.ajax({
      url: "/"+route,
      type: "post",
      success(books){
        that.setState({loaded: true, books: books});
      }
    })  
  },
  render(){
    if( !this.state.loaded )
      return(
        <div className="loading-screen">
          <i className="fa fa-cog fa-spin fa-3x fa-fw" aria-hidden="true"></i>
          <span className="sr-only">Loading...</span>
        </div>
      )

    return(
      <div id="book-shelf" className="book-shelf card-columns">
      {
        this.state.books.map((book, i) => {
          return <Book data={ book } key={ i }/>
        })
      }
      </div>
    )
  }
})


// BookPage
// -----------------------------------------------
// Shows the details of the book when a book is clicked.

var BookPage = React.createClass({
  getInitialState(){
    console.log(this.props.data);
    return{
      isOwned: this.props.data.owned
    }
  },
  contextTypes:{
    setPage: React.PropTypes.func,
    authed: React.PropTypes.bool
  },
  goToLastSearch(){
    console.log(this.props.lastSearch);
    this.context.setPage(this.props.lastSearch)
  },
  render(){
    console.log(this.context);
    return(
      <div className="book-page">
        <div className="book-page-header row">
          <div className="col-xs-12">
            <button className="btn btn-warning btn-block" onClick={ this.goToLastSearch }><i className="fa fa-arrow-circle-left"/> Back to my search results.</button>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-4">
            <img src={ this.props.data.thumbnail }/>
          </div> 
          <div className="col-xs-4">
            <BookPageButtons owned={ this.props.data.owned } bookID={ this.props.data.id }/>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <h2 className="title">{ this.props.data.title }</h2>
            <h4>Description:</h4>
            <p dangerouslySetInnerHTML={{ __html: this.props.data.description || "Sorry, could not find any description..."}}></p>
          </div>
        </div>
        <div className="book-page-footer row">
          <div className="col-xs-12">
          </div>
        </div>
      </div>
    )
  }
})


// BookPageButtons
// Buttons that are shown when logged in and on a Book Page
//-----------------------------------------------------------

var BookPageButtons = React.createClass({
  contextTypes:{
    authed: React.PropTypes.bool
  },
  getInitialState(){
    return{
      owned: this.props.owned
    } 
  },
  componentWillReceiveProps(nextProps){
    this.setState({owned: nextProps.owned})
  },
  toggleOwn(){
    this.setState({owned: !this.state.owned}) 
    var that = this;
    $.ajax({
      type: "post",
      url: "/addBook/" + this.props.bookID,
    })
  },
  render(){
    switch(this.context.authed){
      case true:
        switch(this.state.owned){
          case true:
            return(
              <div className="bookPageButtons">
                <div className="card card-inverse card-success text-xs-center">
                  <div className="card-block">
                    <p className="card-text">
                      I own this book.
                    </p>
                  </div>
                </div>
                <button className="btn btn-default btn-block">Offer Trade.</button>
              </div>
            )
          case false:
            return(
              <div className="bookPageButtons">
                <button className="btn btn-default btn-block" onClick={ this.toggleOwn }>I have this book!</button>
              </div>
            )
        }

      case false:
        return (<p></p>);
    }
  }
})


// Slider Button
//----------------

var SliderButton = React.createClass({
  getInitialState(){
    return{
    left: false
    }
  },
  containerStyle(){
    return{
      justifyContent: "space-around",
      display: "inline-flex",
      width: "100%",
      outline: "none"
    }
  },
  buttonContainerStyle() {
    var size = this.props.size;
    return{
      position: "relative",
      height: size,
      width: size * 2
    }
  },
  leftPartStyle(){
    var size = this.props.size * 1;
    return{
      backgroundColor: "#337ab7",
      borderTopLeftRadius: 50,
      borderBottomLeftRadius: 50,
      width: size,
      height: size,
      position: "absolute"
    }
  },
  rightPartStyle(){
    var size = this.props.size * 1;
    var gap = this.props.gap * 1;
    return{
      backgroundColor: "#337ab7",
      borderTopRightRadius: 50,
      borderBottomRightRadius: 50,
      width: size,
      height: size,
      position: "absolute",
      left: size
    }
  },
  buttonStyle(){
    var size = this.props.size * 1;
    var gap = this.props.gap * 1;
    return{
      backgroundColor: "white",
      position: "absolute",
      zIndex: 1,
      borderRadius: 50,
      top: gap,
      width:  size - (gap * 2),
      height:  size - (gap * 2),
      transition: "0.2s"
    }
  },
  buttonLeftStyle(){
    var gap = this.props.gap * 1;
    return{
      left: gap 
    }
  },
  buttonRightStyle(){
    var size = this.props.size * 1;
    var gap = this.props.gap * 1;
    return{
      left:  size + gap
    }
  },
  toggleButton(){
    var left = this.state.left;
    this.props.toggle(left);
    this.setState({ left: !left})
  },
  render(){
    return(
      <div tabIndex="0" role="button" className="slider-button" aria-label="Toggle between searching Everything and Trades-Only" style={ this.containerStyle() } onClick={this.toggleButton}>
        <div >{ this.props.left }</div>
        <div style={ this.buttonContainerStyle() }>
          <div style={ this.leftPartStyle() }></div>
          <div style={ this.rightPartStyle() }></div>
          <div style={ $.extend({}, this.buttonStyle(), ( this.state.left ? this.buttonLeftStyle() : this.buttonRightStyle() )) } ></div>
        </div>
        <div>{ this.props.right } </div>
      </div>
    )
  }
})
