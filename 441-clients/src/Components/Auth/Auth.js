import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Jumbotron } from 'react-bootstrap'
import PageTypes from '../../Constants/PageTypes/PageTypes';
import LandingPage from './Components/LandingPage';
import SignUp from './Components/SignUp';
import SignIn from './Components/SignIn';
import ForgotPassword from './Components/ForgotPassword';

/**
 * @class Auth
 * @description This is an auth object that controls what page
 * is loaded based on sign up or sign in state
 */
const Auth = ({ setAuthToken, setUser }) => {
    // var content = <LandingPage setPage={setPage} />
    const [page, setPage] = useState(PageTypes.landing)
    // let content = :
    // const setPage = (page) => {
    //     e.preventDefault();
    //     console.log("clicked")
    //     this.setState({ page });
    // }

    var content = "";

    switch (page) {
        case PageTypes.landing:
           content = (<LandingPage setPage={setPage} />)
           break
        case PageTypes.signUp:
            content = <SignUp setPage={setPage} setAuthToken={setAuthToken} setUser={setUser} />
            break
        case PageTypes.signIn:
            content = <SignIn setPage={setPage} setAuthToken={setAuthToken} setUser={setUser} />
            break
        // case PageTypes.forgotPassword:
        //     content = <ForgotPassword setPage={setPage} />
        default:
            content = (<LandingPage setPage={setPage} />)
            break
    }

    // return <>{content}</>
    return (
        <Jumbotron fluid={true} className="mh-100 h-100 mb-0 flex-grow-1">
            <Container fluid={true} className="">{content}</Container>
            {/* {content} */}
        </Jumbotron>
    )
}

Auth.propTypes = {
    page: PropTypes.string.isRequired,
    setPage: PropTypes.func.isRequired,
    setAuthToken: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired
}

const AuthContentWrapper = ({ content }) => {
    return (
        <Jumbotron className="">
            <Container fluid={true}>{content}</Container>
        </Jumbotron>
    )
}

export default Auth;