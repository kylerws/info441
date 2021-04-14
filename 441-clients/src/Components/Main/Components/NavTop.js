import React from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Nav, Navbar, NavDropdown, Row, Col } from 'react-bootstrap'
import { ProfileButton, SignOutButton } from './ProfileButtons'

const NavTop = ({showUpdateName}) => {
  let user = useAuth().user
  let name = user.firstName && user.lastName ?
    user.firstName + " " + user.lastName :
    user.userName
  return (
    <Navbar collapseOnSelect expand="sm"
      fixed="top" bg="dark" variant="dark" className="justify-content-center justify-content-md-between" id="navtop">
      <Navbar.Brand href="/" className="">
          <div className="">Dashboard</div>
        </Navbar.Brand>
        
      <Navbar.Toggle aria-controls="responsive-navbar-nav" className="ml-auto"/>
      <Navbar.Collapse className="">
        <Nav className="ml-auto d-flex align-items-center">
          <Navbar.Text className="mx-auto my-2 my-sm-0">Welcome back, {name}</Navbar.Text>
            <Col xs={12} sm={"auto"} className="d-flex d-sm-none px-0 pb-2">
              <ProfileButton showUpdateName={showUpdateName} className="flex-grow-1 flex-sm-grow-0" /> </Col>
            <Col xs={12} sm={"auto"} className="d-flex d-sm-none px-0 pb-2">
              <SignOutButton className="flex-grow-1 flex-sm-grow-0" /> </Col>

            <Nav.Item className="mx-3 d-none d-sm-inline-block"><ProfileButton showUpdateName={showUpdateName} /></Nav.Item>
            <Nav.Item className="d-none d-sm-inline-block" ><SignOutButton /></Nav.Item>
         
        </Nav>
      </Navbar.Collapse>
      
      {/* <NavDropdown></NavDropdown> */}
    </Navbar>
  )
}

export default NavTop