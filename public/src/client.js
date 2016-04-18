$(document).ready(function(){
  ReactDOM.render(
    <App/>,
    document.getElementById("wrapper")
  );
})

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
      currentPage: "home",
      authed: false,
      user: {}
    }
  },
  componentWillMount(){
    this.checkAuth();
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
  setPage(page){
    this.setState({currentPage: page});
  },
  render(){
    return(
      <div className="panel panel-default app">
        <Header/>
        <Body page={ this.state.currentPage }/>
      </div>
    )
  }
})

var Header = React.createClass({
  render(){
    return(
      <div id="header" className="row">
        <div className="col-md-1"></div>
        <div className="col-md-11 col-xs-12">
          <Navbar/> 
        </div>
      </div>
    )
  }
})

var Body = React.createClass({
  render(){
    return(
      <div id="content" className="row">
        <div className="col-md-1"></div>
        <div id="content-inner" className="col-md-8 col-xs-10">
          <SignupModal/> 
          {(()=>{
            if(this.props.page == "AccountSettings"){
              return <AccountSettings/>
            }
          })()
          }
        </div>
        <div id="sidebar" className="col-md-3 col-xs-2">
          <SideBar/> 
        </div>
      </div>
    )
  }
})

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
          else return <LoginForm/>;
        })()
        }
      </div>
    )
  }
})

var Navbar = React.createClass({
  render(){
    return(
      <nav className="navbar navbar-light bg-faded">
        <a className="navbar-brand">Bookilook</a>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="home-btn nav-item" ><a>Home</a></li>
        </ul>
      </nav>
    )
  }
});;

var SearchBar = React.createClass({
  render(){
    return(
      <div className="search-bar">
        <form action="/search" method="post">
          <div className="form-group">
            <label>Booksearch</label>
            <input type="text" className="form-control" name="booksearch"/>
          </div>
          <button className="btn btn-default btn-block" type="submit">Search!</button>
        </form> 
      </div>
    )
  }
}) 

var Logout = React.createClass({
  contextTypes: {
    authed: React.PropTypes.bool,
    user: React.PropTypes.object,
    setPage: React.PropTypes.func
  },
  showUser(){
    this.context.setPage("AccountSettings");
  },
  render(){
    return(
      <div className="logout">
        <form action="/logout" method="post">
          <label>Logged in as <a href="#" onClick={ this.showUser }> {( this.context.user.username ? this.context.user.username : this.context.user.email )}</a></label>
          <button className="btn btn-warning btn-block" type="submit">Logout...</button>
        </form>
        <hr/>
        <button className="btn btn-default btn-block">My Books</button>
      </div> 
    )
  }
})

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

var LoginForm = React.createClass({
  getInitialState(){
    return{
      message: ""
    }
  },
  contextTypes: {
    checkAuth: React.PropTypes.func
  },
  componentDidMount(){

    var that = this;

    $("#login-form-form").submit(function(e){
      e.preventDefault();
      var data = {
        email: e.target[0].value,
        password: e.target[1].value
      }

      if(!data.email || !data.password) that.setMessage("Please provide a login and password.");

      $.ajax({
        url: "/login",
        type: "post",
        data: data,
        success(data){
          that.setMessage(data.message);
          that.context.checkAuth();
        }
      })
    });

  },
  setMessage(message){
    this.setState({message: message});
  },
  render(){
    return(
      <div>
        <div className="login-form collapse" id="login-form">
          <form id="login-form-form">
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
        <button className="btn btn-primary btn-block login-collapse-button" type="button" data-toggle="collapse" data-target="#login-form" aria-expanded="false" aria-controls="login-form">
           <i className="fa fa-sign-in" aria-hidden="true"></i>
        </button>
      </div>
    )
  }
})

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
