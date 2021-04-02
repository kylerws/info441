import React, { Component } from 'react'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { Container, Jumbotron, Row, Col } from 'react-bootstrap'

import Auth from './Components/Auth/Auth';
import Main from './Components/Main/Main'
import Footer from './Components/Footer'
import api from './constants/APIEndpoints'

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
    constructor() {
        super();
        this.state = {
            authToken: localStorage.getItem("Authorization") || null,
            user: localStorage.getItem("user") || null
        }
    }

    render() {
        // const { user } = this.state
        // let authed = this.state.authToken !== null
        // console.log(this.state.authToken)
        // console.log(authed)
        return(
            <Router>
                <Switch>
                    <PrivateRoute path="/dashboard"
                        authed={this.state.authToken !== null}
                        component={Main}
                        componentProps={{
                            authed: this.state.authToken !== null,
                            setAuthToken: this.setAuthToken,
                            user: this.state.user,
                            setUser: this.setUser
                        }} />
                    <Route path="/"
                        render={() => <Auth authed={this.state.authToken !== null}
                                            // setAuthed={this.setAuth}
                                            setAuthToken={this.setAuthToken}
                                            setUser={this.setUser} />} />
                </Switch>
                <Footer />
            </Router>
        )
    }

    componentDidMount() {
        this.getCurrentUser();
    }

    /**
     * @description Gets the users
     */
    getCurrentUser = async () => {
        if (!this.state.authToken) {
            return;
        }

        const response = await fetch(api.base + api.handlers.myuser, {
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });

        // If no user, remove all auth and log out
        if (response.status >= 300) {
            console.log("Unable to verify login. Logging out...");
            localStorage.setItem("Authorization", "");
            // this.setAuthToken("");
            // this.setUser(null)
            this.setState({ authToken: "", user: null })
            return
        }

        // Get user data returned by server
        const user = await response.json()
        this.setUser(user);
    }

    /**
     * @description sets auth token
     */
    setAuthToken = (authToken) => {
        this.setState({ authToken });
    }

    // State boolean for whether current session is authenticated
    // setAuth = (authed) => {
    //     this.setState({ authed })
    // }

    /**
     * @description sets the user
     */
    setUser = (user) => {
        // user !== null ?
        //     localStorage.setItem("user", user) :
        //     localStorage.removeItem("user")
        this.setState({ user });
    }

//     render() {
//         
//         return (
//             <Container fluid={true} className="min-vh-100 h-100 p-0 d-flex flex-column" id="custom">
//                 <Jumbotron fluid={true} className="bg-dark text-white mb-0 bg-img-cover" aria-label="fall leaves trail image"
//                     id="header">
//                     <Container fluid={true} className="px-5">
//                         <h1>ScheduleUp</h1>
//                         <h2 className="">Our scheduling, your team</h2>
//                     </Container>
//                 </Jumbotron>
//                 {user ?
//                     <Main 
//                         auth={this.state.authToken}
//                         page={page}
//                         setPage={this.setPage}
//                         setAuthToken={this.setAuthToken}
//                         user={user}
//                         setUser={this.setUser} />
//                     :
//                     <Auth 
//                     // page={page}
//                     //     setPage={this.setPage}
//                         className="h-100"
//                         setAuthToken={this.setAuthToken}
//                         setUser={this.setUser} />
//                 }
//             </Container>
//         );
//     }
}

// function PrivateRoute({authed, ...rest}) {
//     return authed ?
//         <Route {...rest} /> :
//         <Redirect to={{pathname: '/', state: {from: props.location}}} />
// }

function PrivateRoute ({component: Component, authed, componentProps, ...rest}) {
    return (
      <Route
        {...rest}
        render={(props) => authed === true
          ? <Component {...props} {...componentProps} />
          : <Redirect to={{pathname: '/', state: {from: props.location}}} />}
      />
    )
}

export default App;