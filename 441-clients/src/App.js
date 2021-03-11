import React, { Component } from 'react';
import { Container, Row } from 'react-bootstrap';
import Auth from './Components/Auth/Auth';
import PageTypes from './Constants/PageTypes/PageTypes';
import Main from './Components/Main/Main';
import api from './Constants/APIEndpoints/APIEndpoints';
// import { SignOutButton } from './Components/Main/Components/SignOutButton/SignOutButton';

import './Styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
    constructor() {
        super();
        this.state = {
            page: localStorage.getItem("Authorization") ? PageTypes.signedInMain : PageTypes.signIn,
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

    render() {
        const { page, user } = this.state;
        return (
            <div>
                <header className="jumbotron jumbotron-fluid bg-dark text-white" aria-label="fall leaves trail image">
                    <div className="container">
                        <h1>Schedule Up</h1>
                        <p className="lead">Use our website
                            to conveniently schedule meetings with your teams!
                        </p>
                    </div>
                </header>
                {user ?
                    <Main 
                        auth={this.state.authToken}
                        page={page}
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
                <footer>
                    
                </footer>
            </div>
        );
    }
}

// class ProfileButtons extends Component {
//     render() {
//         return(
//             <Container fluid={true}>
//                 <Row className="justify-content-end">test
//                     <button onClick={(e) => this.props.setPage(e, PageTypes.signedInUpdateName)}>Edit Profile</button>
//                     <SignOutButton setUser={this.props.setUser} setAuthToken={this.props.setAuthToken} />
//                 </Row>
//             </Container>
//         )
//     }
// }

export default App;