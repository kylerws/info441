import React from 'react';
import { useAuth } from '../../hooks/useAuth'
import { Jumbotron } from 'react-bootstrap'

import MainPageContent from './Content/MainPageContent'
import NavTop from './Components/NavTop'
import ProfileButtons from './Components/ProfileButtons'
import UpdateName from './Components/UpdateName'

export default function Main() {
  let auth = useAuth()
  

  return <>
    <NavTop />
    {/* <Jumbotron fluid={true} className="bg-info text-light mb-0 p-4">
        <ProfileButtons signOut={auth.signout} />
    </Jumbotron> */}
    <MainPageContent auth={auth.authToken} user={auth.user} />
  </>
}