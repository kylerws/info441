import React from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Row, Button } from 'react-bootstrap'

export default function ProfileButtons() {
  let auth = useAuth()

  return(
      <Row className="justify-content-end mr-1">
        <Button size="sm" variant="dark" className="mx-3"
          onClick={(e) => console.log("clicked")}>Edit Profile</Button>
        <Button size="sm" variant="danger"
          onClick={async (e) => {
            e.preventDefault()
            console.log("sign out")
            auth.signout()
          }}>Sign Out</Button>
      </Row>
  )
}