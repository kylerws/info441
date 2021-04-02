import React from 'react';
import { Container, Row, Button } from 'react-bootstrap';

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

export default ProfileButtons