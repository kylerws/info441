import React, { useState } from 'react';
import { Container, Jumbotron, Row, Col } from 'react-bootstrap'

export default function Footer() {
  return (
    <Jumbotron fluid={true} className="bg-info text-light mb-0 p-3">
        <Row className="align-items-end">
            <Col><p>Winter 2021</p></Col>
            <Col><p className="text-center">Project developed for INFO 441</p></Col>
            <Col>
                <p className="text-right mb-1">Kyler Sakumoto</p>
                <p className="text-right mb-0">Mackenzie Hutchison</p>
            </Col>
        </Row>
    </Jumbotron>
  )
}