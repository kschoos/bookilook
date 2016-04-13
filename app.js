"use strict";

var React = require("react");

module.exports = React.createClass({
  displayName: "exports",
  getInitialState: function getInitialState() {
    return {
      count: this.props.initialCount
    };
  },
  incrementCount: function incrementCount() {
    this.setState({ count: this.state.count + 1 });
  },
  render: function render() {
    return React.createElement(
      "div",
      { className: "bubu" },
      React.createElement(
        "h1",
        null,
        this.state.count
      ),
      React.createElement(
        "button",
        { className: "btn btn-default btn-warning", onClick: this.incrementCount },
        "Click me!"
      )
    );
  }
});