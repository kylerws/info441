import React from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Button } from 'react-bootstrap'

export const ProfileButton = ({showUpdateName, ...props}) => {
  return <Button {...props} size="sm" variant="secondary"
    onClick={showUpdateName}>Profile</Button>
}

export const SignOutButton = ({...props}) => {
  let auth = useAuth()

  return <Button {...props} size="sm" variant="danger"
    onClick={async (e) => {
      e.preventDefault()
      console.log("sign out")
      auth.signout()
    }}>Sign Out</Button>
}