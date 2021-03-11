import React, { Component } from 'react';
import { Container, Row, Button } from 'react-bootstrap';
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
            <footer>
                <ProfileButtons setPage={setPage} setUser={setUser} setAuthToken={setAuthToken} />
            </footer>
        </>
    )
}

class ProfileButtons extends Component {
    render() {
        return(
            <Container fluid={true}>
                <Row className="justify-content-end">
                    <Button variant="light"
                        onClick={(e) => this.props.setPage(e, PageTypes.signedInUpdateName)}>Edit Profile</Button>
                    <SignOutButton setUser={this.props.setUser} setAuthToken={this.props.setAuthToken} />
                </Row>
            </Container>
        )
    }
}

export default Main;