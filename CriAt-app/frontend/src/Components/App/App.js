import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import { connect } from 'react-redux';

import Home from "../Home/Home";
import './App.css';

class App extends Component {

  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route component={Error}/>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default connect()(App);
