import React, { Component } from 'react';
import { Button, Col, Row } from 'react-bootstrap'
import PageTypes from '../../../constants/PageTypes'

export default class LandingPage extends Component {
  render() {
    return(
      <Row className="h-100 justify-content-center px-3">
        <Col xl={10} className="h-100 d-flex flex-column justify-content-start">
          <Row className="h-60 flex-column flex-grow-1 justify-content-between text-center">
            <Col><h1>Team meetings, made easy</h1>
            <hr className="d-none d-sm-block"></hr>
              <h2>Finding times to meet shouldn't be complicated. We make it easy for you.</h2>
              <h2>Enter your availability, create a team, and see what times are available to meet</h2>
            </Col>
          </Row>
          <Row className="justify-content-center mb-5">
            <Col sm={5} md={4} className="mb-3">
              <Button size="lg" variant="warning" className="w-100"
                  onClick={(e) => this.props.setPage(PageTypes.signUp)}>Get Started</Button>
            </Col>
            <Col sm={5} md={4}>
              <Button size="lg" variant="info" className="w-100"
                onClick={(e) => this.props.setPage(PageTypes.signIn)}>Sign In</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}