import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth'
import { TeamProvider } from '../../hooks/useTeam'
import { Container } from 'react-bootstrap'

import Dashboard from './views/DashboardView'
import TeamView from './views/TeamView'
import NavTop from './components/NavTop'
import Modal from './components/Modal'
import UpdateName from './components/UpdateName'

export default function Main() {
  let auth = useAuth()
  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  return <>
    <NavTop showUpdateName={handleShow} />
    <Container fluid={true} className="p-0 h-100 d-flex flex-column" id="main">
      <Dashboard auth={auth.authToken} user={auth.user} />
      <TeamProvider>
        <TeamView />
      </TeamProvider>
    </Container>
    <Modal show={show} hide={handleClose} title="Your Profile" content={<UpdateName id="profile"/>} />
  </>
}