import React, { Component } from 'react';
import Auth from './Components/Auth/Auth';
import PageTypes from './Constants/PageTypes/PageTypes';
import Main from './Components/Main/Main';
import AboutNav from './Components/AboutNav';
import './Styles/App.css';
import api from './Constants/APIEndpoints/APIEndpoints';

class App extends Component {
    constructor() {
        super();
        this.state = {
            page: localStorage.getItem("Authorization") ? PageTypes.signedInMain : PageTypes.signIn,
            authToken: localStorage.getItem("Authorization") || null,
            user: null,
            teams: null
        }

        this.getCurrentUser()
        this.getCurrentTeams()
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
        if (response.status >= 300) {
            alert("Unable to verify login. Logging out...");
            localStorage.setItem("Authorization", "");
            this.setAuthToken("");
            this.setUser(null)
            return;
        }
        const user = await response.json()
        this.setUser(user);

    }


    /**
     * @description Gets the teams
     */
     getCurrentTeams = async () => {
        if (!this.state.authToken) {
            return;
        }
        const response = await fetch(api.base + api.handlers.teams, {
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });
        if (response.status >= 300) {
            alert("Unable to verify login. Logging out...");
            localStorage.setItem("Authorization", "");
            this.setAuthToken("");
            this.setTeams(null)
            return;
        }
        const teams = await response.json()
        this.setTeams(teams);

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

    /**
     * @description sets the user
     */
     setTeams = (user) => {
        this.setState({ user });
    }

    render() {
        const { page, user } = this.state;
        return (
            <main>
                <h1>Final Project Client</h1>
                <h2>INFO 441</h2>
                <div>
                    <AboutNav></AboutNav>
                </div>
                <div>
                    {user ?
                        <Main page={page}
                            setPage={this.setPage}
                            setAuthToken={this.setAuthToken}
                            user={user}
                            setUser={this.setUser} />
                        :
                        <Auth page={page}
                            setPage={this.setPage}
                            setAuthToken={this.setAuthToken}
                            setUser={this.setUser} />
                    }
                </div>
            </main>
        );
    }
}

export default App;