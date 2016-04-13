var React = require("react");

module.exports = React.createClass({
  getInitialState(){
    return{
      count: this.props.initialCount
    }
  },
  incrementCount(){
    this.setState({count: this.state.count+1});
  },
  render(){
    return(
      <div className="bubu">
        <h1>{ this.state.count }</h1>
        <button className="btn btn-default btn-warning" onClick={ this.incrementCount }>Click me!</button>
      </div>
    )
  }
})
