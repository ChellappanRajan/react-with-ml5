import React, { Component } from 'react';

//Import Router
import {BrowserRouter as Router,Route,Switch} from 'react-router-dom';
import './App.css';
import Nav from './Nav';
// import Pretrained from './Pretrained';
import Transfer from './Transfer';

class App extends Component {
  render() {
    return (
     <Router>
      <div className="App">
      <Nav/>
      <Switch>
        {/* <Route exact path="/" component={Pretrained} /> */}
        <Route exact path="/" component={Transfer} />
      </Switch>
      
       </div>
      </Router>

    );
  }
}

export default App;

