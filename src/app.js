import React from 'react';
import ReactDOM from 'react-dom';
import { square, diag } from './math.js';
import './app.css';

console.log(square(11)); // 121
console.log(diag(4, 3)); // 5

class ButtonContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false
    };
  }
  onClick = () => {
    this.setState({ disabled: !this.state.disabled });
  }
  render() {
    return (
      <div>
      <p>Hello World</p>
      </div>
    );
  }
}

ReactDOM.render(
  <div>
  <h1>This is my app</h1>
  </div>,
  document.getElementById('app')
);
