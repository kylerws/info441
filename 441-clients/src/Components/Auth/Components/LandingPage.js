import React, { Component } from 'react';
import { Button, Row } from 'react-bootstrap'
import PageTypes from '../../../Constants/PageTypes/PageTypes'

export default class LandingPage extends Component {
  render() {
    return(
      <Row className="justify-content-center">
          <Button size="lg" variant="dark" className="mr-3"
            onClick={(e) => this.props.setPage(PageTypes.signIn)}>Sign In</Button>
          <Button size="lg" variant="warning"
            onClick={(e) => this.props.setPage(PageTypes.signUp)}>Sign Up</Button>
      </Row>
    )
  }
}