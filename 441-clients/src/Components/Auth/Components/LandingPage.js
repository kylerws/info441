import React, { Component } from 'react';
import { Button, Container, Jumbotron, Row } from 'react-bootstrap'
import PageTypes from '../../../Constants/PageTypes/PageTypes'

export default class LandingPage extends Component {
  render() {
    return(
      <Jumbotron className="">
        <Container fluid={true}>
            <Row className="justify-content-center">
                <Button size="lg" variant="dark"
                  onClick={(e) => this.props.setPage(e, PageTypes.signIn)}>Sign In</Button>
                <Button size="lg" variant="warning"
                  onClick={(e) => this.props.setPage(e, PageTypes.signUp)}>Sign Up</Button>
            </Row>
        </Container>
      </Jumbotron>
    )
  }
}