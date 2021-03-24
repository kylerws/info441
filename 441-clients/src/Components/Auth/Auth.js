import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Jumbotron, Row, Col } from 'react-bootstrap'
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

    return (<>
        <Jumbotron fluid={true} className="mh-100 h-100 mb-0 flex-grow-1">
            <Container fluid={true} className="h-100">{content}</Container>
        </Jumbotron>
        <Jumbotron fluid={true} className="bg-info text-light mb-0 p-3">
            <Row className="align-items-end">
                <Col><p>Winter 2021</p></Col>
                <Col><p className="text-center">Project developed for INFO 441</p></Col>
                <Col>
                    <p className="text-right mb-1">Kyler Sakumoto</p>
                    <p className="text-right mb-0">Mackenzie Hutchison</p>
                </Col>
            </Row>
        </Jumbotron>
    </>)
}

Auth.propTypes = {
    // page: PropTypes.string.isRequired,
    // setPage: PropTypes.func.isRequired,
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