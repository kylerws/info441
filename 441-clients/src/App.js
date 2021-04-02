import React from 'react'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { ProvideAuth, useAuth } from './hooks/useAuth'

// import { Container, Jumbotron, Row, Col } from 'react-bootstrap'

import Auth from './Components/Auth/Auth';
import Main from './Components/Main/Main'
import Footer from './Components/Footer'

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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

// OLD RENDER METHOD
// render() {
//     return (
//         <Container fluid={true} className="min-vh-100 h-100 p-0 d-flex flex-column" id="custom">
//             <Jumbotron fluid={true} className="bg-dark text-white mb-0 bg-img-cover" aria-label="fall leaves trail image"
//                 id="header">
//                 <Container fluid={true} className="px-5">
//                     <h1>ScheduleUp</h1>
//                     <h2 className="">Our scheduling, your team</h2>
//                 </Container>
//             </Jumbotron>
//             {user ?
//                 <Main 
//                     auth={this.state.authToken}
//                     page={page}
//                     setPage={this.setPage}
//                     setAuthToken={this.setAuthToken}
//                     user={user}
//                     setUser={this.setUser} />
//                 :
//                 <Auth 
//                 // page={page}
//                 //     setPage={this.setPage}
//                     className="h-100"
//                     setAuthToken={this.setAuthToken}
//                     setUser={this.setUser} />
//             }
//         </Container>
//     );
// }

