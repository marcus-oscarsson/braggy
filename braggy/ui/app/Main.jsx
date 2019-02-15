import React, { Component } from 'react';
import { Route } from 'react-router-dom';
// import ImageView from '../imageview/imageview-widget';
import Drawer from './Drawer';

import './app.css';

class Main extends Component {
  render() {
    return (
      <div className="app">
        <div>
          <Route exact path="/" component={Drawer} />
        </div>
      </div>
    );
  }
}

export default Main;
