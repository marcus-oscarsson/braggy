import React, { Component } from 'react';
import { Route } from 'react-router-dom';
// import ImageView from '../imageview/imageview-widget';
import Drawer from './drawer-widget';

import './app.css';

class App extends Component {
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

export default App;
