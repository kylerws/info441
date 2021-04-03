import React, { useState } from 'react';
import { Redirect } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

import { Container, Jumbotron, Row, Col } from 'react-bootstrap'
import PageTypes from '../../constants/PageTypes';
import LandingPage from './Components/LandingPage';
import SignUp from './Components/SignUp';
import SignIn from './Components/SignIn';

/**
 * @class Auth
 * @description This is an auth object that controls what page
 * is loaded based on sign up or sign in state
 */
export default function Auth() {
  let auth = useAuth()
  const [page, setPage] = useState(PageTypes.landing)

  if (auth.user) {
      return <Redirect to={{pathname: "/dashboard"}} />
  }

  let content = "";
  switch (page) {
    case PageTypes.landing:
      content = (<LandingPage setPage={setPage} />)
      break
    case PageTypes.signUp:
      content = <SignUp setPage={setPage} signUp={auth.signup} />
      break
    case PageTypes.signIn:
      content = <SignIn setPage={setPage} signIn={auth.signin} />
      break
    default:
      content = (<LandingPage setPage={setPage} />)
      break
  }

  return (
    <Container fluid={true} className="p-0 h-100 d-flex flex-column">
      <Jumbotron fluid={true} className="bg-dark text-white mb-0 bg-img-cover" id="header">
        <Container fluid={true} className="px-5">
          <h1>ScheduleUp</h1>
          <h2 className="">Our scheduling, your team</h2>
        </Container>
      </Jumbotron>
      <Jumbotron id="auth" fluid={true} className="bg-landing flex-grow-1 pt-3 pt-sm-3 pt-md-5">
        <Container fluid={true} className="h-100">{content}</Container>
      </Jumbotron>
    </Container>
  )
}