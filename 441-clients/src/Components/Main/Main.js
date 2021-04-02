import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect, useLocation, useHistory } from 'react-router-dom'

import { Container, Row, Jumbotron, Button } from 'react-bootstrap';
import PageTypes from '../../Constants/PageTypes';
import MainPageContent from './Content/MainPageContent';
import SignOutButton from './Components/SignOutButton/SignOutButton';
import UpdateName from './Components/UpdateName';

const Main = ({ auth, page, authed, setAuthToken, setUser, user }) => {
    let location = useLocation();
    let history = useHistory();

    // return <div>Logged In!</div>
    // if (!) {
    //     return <Redirect to={'/'} from={location} />
    // }

    return (
        <>
            <MainPageContent auth={auth} user={user} />
            <Jumbotron fluid={true} className="bg-info text-light mb-0 p-4">
                <ProfileButtons
                    signOut={() => history.push("/")}
                    setAuthToken={setAuthToken}
                    setUser={setUser} />
            </Jumbotron>
        </>
    )
}

Main.propTypes = {
    setAuthToken: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired
}

const ProfileButtons = ({ setAuthToken, setUser, signOut }) => {
    return(
        <Container fluid={true}>
            <Row className="justify-content-end">
                <Button variant="dark" className="mx-3"
                    onClick={(e) => console.log("clicked")}>Edit Profile</Button>
                <SignOutButton setUser={setUser} setAuthToken={setAuthToken} signOut={signOut} />
            </Row>
        </Container>
    )
}

    

export default Main;