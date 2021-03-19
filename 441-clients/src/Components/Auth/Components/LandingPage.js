import React, { Component } from 'react';
import { Button, Col, Row } from 'react-bootstrap'
import PageTypes from '../../../Constants/PageTypes/PageTypes'

export default class LandingPage extends Component {
  render() {
    return(
      <Row className="h-100">
        <Col>
        <Row className="justify-content-center mt-5 mb-3">
          <Col xs={3}>
            <Button size="lg" variant="warning" className="w-100"
                onClick={(e) => this.props.setPage(PageTypes.signUp)}>Get Started</Button>
          </Col>
        </Row>
        
        <Row className="justify-content-center">
          <Col xs={3}>
            <Button size="lg" variant="info" className="w-100"
              onClick={(e) => this.props.setPage(PageTypes.signIn)}>Sign In</Button>
          </Col>
        </Row>
        </Col>
        
      </Row>
    )
  }
}