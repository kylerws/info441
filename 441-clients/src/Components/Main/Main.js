import React, { Component } from 'react';
import { Container, Row, Jumbotron, Button } from 'react-bootstrap';
import PageTypes from '../../Constants/PageTypes/PageTypes';
import MainPageContent from './Content/MainPageContent';
import SignOutButton from './Components/SignOutButton/SignOutButton';
import UpdateName from './Components/UpdateName/UpdateName';

const Main = ({ auth, page, setPage, setAuthToken, setUser, user }) => {
    let content = <></>
    let contentPage = true;
    switch (page) {
        case PageTypes.signedInMain:
            content = <MainPageContent auth={auth} user={user} setPage={setPage} />;
            break;
        case PageTypes.signedInUpdateName:
            content = <UpdateName user={user} setUser={setUser} setPage={setPage}/>;
            break;
        default:
            content = <><button onclick={(e) => setPage(e, PageTypes.signedInMain)}>Main</button></>;
            contentPage = false;
            break;
    }
    return (
        <>
            {content}
            <Jumbotron fluid={true} className="bg-info text-light mb-0 p-4">
                <ProfileButtons setPage={setPage} setUser={setUser} setAuthToken={setAuthToken} />
            </Jumbotron>
        </>
    )
}

class ProfileButtons extends Component {
    render() {
        return(
            <Container fluid={true}>
                <Row className="justify-content-end">
                    <Button variant="dark" className="mx-3"
                        onClick={(e) => this.props.setPage(e, PageTypes.signedInUpdateName)}>Edit Profile</Button>
                    <SignOutButton setUser={this.props.setUser} setAuthToken={this.props.setAuthToken} />
                </Row>
            </Container>
        )
    }
}

export default Main;