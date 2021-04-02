import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect, useLocation } from 'react-router-dom'
import { Container, Jumbotron, Row, Col } from 'react-bootstrap'
import PageTypes from '../../constants/PageTypes';
import LandingPage from './Components/LandingPage';
import SignUp from './Components/SignUp';
import SignIn from './Components/SignIn';
// import ForgotPassword from './Components/ForgotPassword';

/**
 * @class Auth
 * @description This is an auth object that controls what page
 * is loaded based on sign up or sign in state
 */
const Auth = ({ authed, setAuthToken, setUser }) => {
    // var content = <LandingPage setPage={setPage} />
    let location = useLocation()
    const [page, setPage] = useState(PageTypes.landing)
    // const [authed, setAuthed] = useState(false)

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
        default:
            content = (<LandingPage setPage={setPage} />)
            break
    }

    if (authed) {
        return <Redirect to="/dashboard" from={location} />
    }

    return (<>
        <Jumbotron fluid={true} className="bg-dark text-white mb-0 bg-img-cover" id="header">
            <Container fluid={true} className="px-5">
                <h1>ScheduleUp</h1>
                <h2 className="">Our scheduling, your team</h2>
            </Container>
        </Jumbotron>
        <Jumbotron fluid={true} className="mh-100 h-100 mb-0 flex-grow-1">
            <Container fluid={true} className="h-100">{content}</Container>
        </Jumbotron>
    </>)
}

Auth.propTypes = {
    setAuthToken: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired
}

export default Auth;