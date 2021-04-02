import React from 'react';
import { useAuth } from '../../hooks/useAuth'

import { Container, Row, Jumbotron, Button } from 'react-bootstrap';
import MainPageContent from './Content/MainPageContent';
import UpdateName from './Components/UpdateName';

const Main = () => {
  let auth = useAuth()

  return (
    <>
      {/* <MainPageContent auth={auth} user={user} /> */}
      {/* <div>test</div> */}
      <Jumbotron fluid={true} className="bg-info text-light mb-0 p-4">
          <ProfileButtons signOut={auth.signout} />
      </Jumbotron>
    </>
  )
}

const ProfileButtons = ({ signOut }) => {
    return(
      <Container fluid={true}>
          <Row className="justify-content-end">
            <Button variant="dark" className="mx-3"
              onClick={(e) => console.log("clicked")}>Edit Profile</Button>
            <Button variant="danger"
              onClick={async (e) => {
                e.preventDefault()
                console.log("sign out")
                signOut()
              }}>Sign Out</Button>
        </Row>
      </Container>
    )
}

    

export default Main;