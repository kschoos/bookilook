$(document).ready(function () {
  ReactDOM.render(React.createElement(Wrapper, { lastSearch: sessionStorage.lastSearch, authed: authed }), document.getElementById("content-inner"));
});
