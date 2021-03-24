import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap'
import Auth from './Components/Auth/Auth';
import PageTypes from './Constants/PageTypes/PageTypes';
import Main from './Components/Main/Main';
import api from './Constants/APIEndpoints/APIEndpoints';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Jumbotron } from 'react-bootstrap';

class App extends Component {
    constructor() {
        super();
        this.state = {
            page: localStorage.getItem("Authorization") ? PageTypes.signedInMain : PageTypes.landing,
            authToken: localStorage.getItem("Authorization") || null,
            user: null
        }

        this.getCurrentUser()
    }


    /**
     * @description Gets the users
     */
    getCurrentUser = async () => {
        if (!this.state.authToken) {
            return;
        }
        console.log(api.base)
        console.log(api.handlers.myuser)
        const response = await fetch(api.base + api.handlers.myuser, {
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });
        if (response.status >= 300) {
            // alert("Unable to verify login. Logging out...");
            localStorage.setItem("Authorization", "");
            this.setAuthToken("");
            this.setUser(null)
            return;
        }
        const user = await response.json()
        this.setUser(user);
    }

    /**
     * @description sets the page type to sign in
     */
    setPageToSignIn = (e) => {
        e.preventDefault();
        this.setState({ page: PageTypes.signIn });
    }

    /**
     * @description sets the page type to sign up
     */
    setPageToSignUp = (e) => {
        e.preventDefault();
        this.setState({ page: PageTypes.signUp });
    }

    setPage = (e, page) => {
        e.preventDefault();
        console.log("clicked")
        this.setState({ page });
    }

    /**
     * @description sets auth token
     */
    setAuthToken = (authToken) => {
        this.setState({ authToken, page: authToken === "" ? PageTypes.signIn : PageTypes.signedInMain });
    }

    /**
     * @description sets the user
     */
    setUser = (user) => {
        this.setState({ user });
    }

    render() {
        const { page, user } = this.state;
        return (
            <Container fluid={true} className="min-vh-100 h-100 p-0 d-flex flex-column" id="custom">
                <Jumbotron fluid={true} className="bg-dark text-white mb-0 bg-img-cover" aria-label="fall leaves trail image"
                    id="header">
                    <Container fluid={true} className="px-5">
                        <h1>ScheduleUp</h1>
                        <h2 className="">Our scheduling, your team</h2>
                    </Container>
                </Jumbotron>
                {user ?
                    <Main 
                        auth={this.state.authToken}
                        page={page}
                        setPage={this.setPage}
                        setAuthToken={this.setAuthToken}
                        user={user}
                        setUser={this.setUser} />
                    :
                    <Auth 
                    // page={page}
                    //     setPage={this.setPage}
                        className="h-100"
                        setAuthToken={this.setAuthToken}
                        setUser={this.setUser} />
                }
            </Container>
        );
    }
}

export default App;