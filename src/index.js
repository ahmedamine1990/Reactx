import React, { Component } from "react";
import ReactDOM from "react-dom";

import './styles.scss';

export class App extends Component {
  constructor() {
    super();

    this.state = {
      value: ""
    };

    //this.handleChange = this.handleChange.bind(this);
  }

  render() {
    return (
      <div>
      <h3>Our Application Is Alive</h3>
      <p>This isn’t reality. This — is fantasy.</p>
      <p>Yes I am quoting Star Trek, I can't help it</p>
      <p>Yes I am quoting Star Trek, I can't help it</p>
    </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
