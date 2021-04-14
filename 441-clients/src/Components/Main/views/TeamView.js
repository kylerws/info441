import React, { useEffect } from 'react'
import moment from 'moment'
import { Button, Col, Container, Collapse, Row, Jumbotron, Card, CardDeck } from 'react-bootstrap'
// import { useAuth } from '../../../hooks/useAuth'
import { useTeam } from '../../../hooks/useTeam'
import { useFlag } from '../../../hooks/helpers'
import { parseSchedule, toDisplayTime } from '../../../hooks/parseSchedule'

import { TeamSelect } from '../components/Inputs'
import { TeamForm, PostMemberForm } from '../components/Forms'

const TeamView = () => {
  let view = useTeamView()
  // Boolean flag hook
  // const [showPostTeam, show, hide] = useFlag(false)

  // Expand button for postScheduleView
  const showPostTeamBtn = <Button size="sm" variant="success" className="ml-auto ml-sm-3 ml-md-4 ml-xl-5"
    onClick={view.showPost}>Create Team</Button>

  // Close button for postScheduleView
  const hidePostTeamBtn = <Button size="sm" variant="dark" className="ml-auto ml-sm-3 ml-md-4 ml-xl-5"
    onClick={view.hidePost}>Hide</Button>

  return (
    <Jumbotron fluid={true} className="bg-secondary text-light mb-5 flex-grow-1 pt-4 px-0">
      <Container fluid={true} className="px-3">
        <Row className="mx-0 mb-3">
          <Col>
            <Row className="align-items-center">
              <h1 className="mb-0">Your Teams</h1>
              <Col className="d-flex p-0">
              {view.showPostTeam ? hidePostTeamBtn : showPostTeamBtn}
              </Col>
            </Row>
          </Col>
          <Col sm={4} xl={3} className="d-none d-sm-block align-self-center">
            <Row>
            <TeamSelect className="d-none d-sm-block" />
            
            </Row>
          </Col>
        </Row>
        <Row className="mx-0"><Col className="p-0">
          <Collapse in={view.showPostTeam}>
            <Row className="mb-4 mb-sm-3">
              <Col>
                <TeamForm />
              </Col>
            </Row>
          </Collapse>
          <Row className="mx-0">
              <TeamSelect className="d-sm-none mb-3" />
          </Row>
          {/* <Jumbotron className="bg-dark py-5 mt-3"> */}
          {/* <Collapse in={!view.showTeamView}>
            <Row className="justify-content-center text-center mt-5"><Col>

            <h2></h2></Col></Row>
          </Collapse> */}
          <Collapse in={view.showTeamView}>
            <Row className="justify-content-around mt-3 mt-lg-4">
              <Col xs={12} sm={6} md={5} lg={4} xl={3}>
                <h2>Available Times</h2>
                <TeamScheduleView />
              </Col>
              <Col sm={6} md={5} lg={4} xl={3}>
                <h2>Members</h2>
                <TeamMembersView />
              </Col>
            </Row>
          </Collapse>
          {/* </Jumbotron> */}
          </Col></Row>
      </Container>
    </Jumbotron>
  )
}

function useTeamView() {
  let teamCtx = useTeam()
  const [showTeamView, showTeam, hideTeam] = useFlag(false)
  const [showPostTeam, showPost, hidePost] = useFlag(false)

  useEffect(() => {
    if (!teamCtx.teamID) {
        hideTeam()
        hidePost()
    } else {
        showTeam()
        hidePost()
    }
  }, [teamCtx.teamID, teamCtx.teams])

  return { showTeamView, showPostTeam, showPost, hidePost }
}

function TeamScheduleView() {
  let teamCtx = useTeam()
  const { teamSchedule } = teamCtx
  const content = !teamSchedule ? "" : parseSchedule({ schedule: teamSchedule, formatTime: toDisplayTime }).map(d => {
    return (
      // <Card key={d.day} bg="info" className="mx-sm-3 flex-grow-1 mw-100 flex-sm-grow-0 mw-sm-auto"
      //   style={{minWidth: '7.5rem', marginBottom: '1rem'}}>
      //   <Card.Header className="text-center"><h1 className="mb-0">{d.day.substring(0, 3)}</h1></Card.Header>
      //   <Card.Body variant="flush">
      //     <h4 className="mb-0 text-center">{d.start + " - "}</h4>
      //     <h4 className="mb-0 text-center">{d.end}</h4>
      //   </Card.Body>
      // </Card>
      <Col xs={12} className="px-0 mb-2 mr-1 flex-grow-1 flex-sm-grow-0 bg-info timeCard">
        <Row className="px-3 py-2 align-items-center">
          <Col className="flex-grow-1">
            <h3 className="mb-0">{d.day.substring(0,3)}</h3></Col>
          {/* <Col className="flex-grow-0"><h2 className="mb-0">{d.start + " - " + d.end}</h2></Col> */}
          <Col className="flex-grow-0"><h4 className="mb-0">{d.start}</h4></Col>
          <Col className="flex-grow-1 p-0 text-center"><h2 className="mb-0">{" - "}</h2></Col>
          <Col className="flex-grow-0"><h4 className="mb-0">{d.end}</h4></Col>
        </Row>
      </Col>
    )
  })

  return <Row className="mx-0 my-4" id="teamSchedule">
    {content}
  </Row>
}

function TeamMembersView() {
  let teamCtx = useTeam()
  const { teamMembers } = teamCtx

  const content = teamMembers.map(m => { return (<Col key={m.email} xs={12}>
    {m.email}</Col>
  )})

  return <Row className="mt-3">
    <Col>
      <Row className=" mb-3">
      {content}
      </Row>
      <PostMemberForm />
    </Col>
  </Row>
}

export default TeamView