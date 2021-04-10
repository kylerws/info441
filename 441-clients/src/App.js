import React from 'react'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { ProvideAuth, useAuth } from './hooks/useAuth'

import Auth from './Components/Auth/Auth'
import Main from './Components/Main/Main'
import Footer from './Components/Footer'

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function App() {
  return(
    <ProvideAuth>
      <Router>
        <Switch>
          <PrivateRoute path="/dashboard" component={Main} componentProps={{}} />
          <Route path="/" render={props => <Auth location={props.location} />} />
        </Switch>
        <Footer />
      </Router>
    </ProvideAuth>
  )
}

function PrivateRoute ({component: Component, componentProps, ...rest}) {
  let auth = useAuth();
  return (
    <Route
      {...rest}
      render={(props) => auth.user ?
        <Component {...props} {...componentProps} /> :
        <Redirect to={{pathname: '/', state: {from: props.location}}} />}
    />
  )
}