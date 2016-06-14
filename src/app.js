import React from 'react';
import ReactDOM from 'react-dom';
import { square, diag } from './math.js';

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
  <ButtonContainer/>
  </div>,
  document.getElementById('app')
);
