$(document).ready(function(){
  ReactDOM.render(
    <App/>,
    document.getElementById("content-inner")
  );
  ReactDOM.render(
    <SideBar/>,
    document.getElementById("sidebar")
  );
})

var App = React.createClass({
  render(){
    return(
      <LoginForm/>
    )
  }
})

var SideBar = React.createClass({
  render(){
    return(
      <div>
        <SearchBar/>
        <hr/>
        {(()=>{
          if(serverData.authed) return <Logout/>;
          else return <LoginForm/>;
        })()
        }
      </div>
    )
  }
})

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
  render(){
    return(
      <div className="logout">
        <form action="/logout" method="post">
          <label>Logged in as { serverData.email }</label>
          <button className="btn btn-warning btn-block" type="submit">Logout...</button>
        </form>
      </div> 
    )
  }
})

var LoginForm = React.createClass({
  render(){
    return(
      <div className="login-form">
        <form action="/login" method="post">
          <div className="form-group">
            <label>E-Mail</label>
            <input type="text" className="form-control" name="email"/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" name="password"/>
          </div>
          <input type="submit" className="btn btn-default btn-block" value="Login!"/>
        </form>
        <hr/>
        <p>Need an account? <a href="#">Signup!</a></p>
        <p>Or go <a href="#">home</a>.</p>
      </div>
    )
  }
})

var SignupForm = React.createClass({
  render(){
    return(
      <div className="signup-form">
        <form action="/signup" method="post">
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
        <hr/>
        <p>Or go <a href="#">home</a>.</p>
      </div>
    )
  }
})
