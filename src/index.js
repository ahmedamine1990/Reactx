import React, { Component } from "react";
import ReactDOM from "react-dom";
import NextEvents from './nextEvents';

export class App extends Component {
  render() {
    return (
      <div class="container">
        <div class="row">
          <NextEvents /> 
        </div>   
    </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"))
