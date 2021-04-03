import React from 'react';
import { Row, Navbar } from 'react-bootstrap'
import logo from '../img/calendar-gradient.svg'

export default function Footer() {
  return (
    <Navbar fixed="bottom" bg="dark" variant="dark" className="justify-content-center justify-content-md-between " id="footer">
      <Navbar.Brand href="/" className="d-none d-sm-inline-block">
        <Row className="align-items-center">
          <img src={logo} width="25" height="25" alt="Brand Logo" className="mx-3 d-none d-sm-inline-block"/>
          <div className="d-none d-md-inline-block">ScheduleUp</div>
        </Row>
        </Navbar.Brand>
      <Navbar.Text className="">Developed by Mackenzie Hutchison and Kyler Sakumoto</Navbar.Text>
      <Navbar.Text className="d-none d-md-inline-block">INFO 441, Winter 2021</Navbar.Text>
    </Navbar>
  )
}