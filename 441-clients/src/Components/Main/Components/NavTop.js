import React from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Row, Navbar } from 'react-bootstrap'
import ProfileButtons from './ProfileButtons'

export default function NavTop() {
  let user = useAuth().user
  let name = user.firstName && user.lastName ?
    user.firstName + " " + user.lastName :
    user.userName
  return (
    <Navbar fixed="top" bg="info" variant="dark" className="justify-content-center justify-content-md-between " id="footer">
      <Navbar.Brand href="/" className="d-none d-sm-inline-block">
          <div className="">Dashboard</div>
        </Navbar.Brand>
      <Navbar.Text className="">Welcome back, {name}</Navbar.Text>
      <ProfileButtons />
    </Navbar>
  )
}