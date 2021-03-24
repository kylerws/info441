import React, { Component } from 'react';
import { Button, Col, Row } from 'react-bootstrap'
import PageTypes from '../../../Constants/PageTypes/PageTypes'

export default class LandingPage extends Component {
  render() {
    return(
      <Row className="pt-5 h-100 justify-content-center">
        <Col xs={12} md={7} className="px-5 mt-3 mb-3 mb-md-5">
          <h2>Team scheduling, done your way. See what times are available to meet, for all your teams.</h2>
        </Col>
        <Col xs={12} md={4}>
          <Row className="justify-content-center mt-3 mb-3">
            <Col xs={10} md={8}>
              <Button size="lg" variant="warning" className="w-100"
                  onClick={(e) => this.props.setPage(PageTypes.signUp)}>Get Started</Button>
            </Col>
          </Row>
          
          <Row className="justify-content-center">
            <Col xs={10} md={8}>
              <Button size="lg" variant="info" className="w-100"
                onClick={(e) => this.props.setPage(PageTypes.signIn)}>Sign In</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}