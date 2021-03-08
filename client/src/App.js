import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import LandingPage from "./components/LandingPage"

import './scss/App.scss'

export default function App() {
  return (
    <Router>        
      <Switch>
        <Route path="/" exact render={() => (<LandingPage />)} />
      </Switch>
    </Router>
  );
}

// Routes
//
// <Route path="/" render={() => (<ComponentName prop={props}/>)} />
// <Route path="/" component={ComponentName} />
