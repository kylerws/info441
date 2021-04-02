import React, { useState } from 'react';
import { Redirect } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

import { Container, Jumbotron } from 'react-bootstrap'
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

  return <>
    <Jumbotron fluid={true} className="bg-dark text-white mb-0 bg-img-cover" id="header">
      <Container fluid={true} className="px-5">
        <h1>ScheduleUp</h1>
        <h2 className="">Our scheduling, your team</h2>
      </Container>
    </Jumbotron>
    <Jumbotron fluid={true} className="mh-100 h-100 mb-0 flex-grow-1">
      <Container fluid={true} className="h-100">{content}</Container>
    </Jumbotron>
  </>
}