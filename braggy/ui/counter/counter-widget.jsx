import React from 'react';
import { push } from 'connected-react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  increment,
  incrementAsync,
  decrement,
  decrementAsync
} from './actions';

const Counter = props => (
  <div>
    <h1>Home</h1>
    <p>Welcome home!</p>
    <button type="button" onClick={() => props.changePage()}>Go to about page via redux</button>
  </div>
);

function mapStateToProps({ counter }) {
  return {
    count: counter.count,
    isIncrementing: counter.isIncrementing,
    isDecrementing: counter.isDecrementing
  };
}

function mapDispatchToProps(dispatch) {
  bindActionCreators({
    increment,
    incrementAsync,
    decrement,
    decrementAsync,
    changePage: () => push('/about-us')
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter);
