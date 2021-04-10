import React, { useEffect } from 'react'
import moment from 'moment'
import { Button, Col, Container, Collapse, Row, Jumbotron, Card } from 'react-bootstrap'
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
  const showPostTeamBtn = <Button size="sm" variant="success"
    onClick={view.showPost}>Create Team</Button>

  // Close button for postScheduleView
  const hidePostTeamBtn = <Button size="sm" variant="dark"
    onClick={view.hidePost}>Hide</Button>

  return (
    <Jumbotron fluid={true} className="bg-secondary text-light mb-5 flex-grow-1 pt-4 px-0">
      <Container fluid={true} className="px-3">
        <Row className="mx-0">
          <Col>
            <Row className="align-items-center">
              <h1>Your Teams</h1>
              <Col className="ml-3">
              {view.showPostTeam ? hidePostTeamBtn : showPostTeamBtn}
              </Col>
            </Row>
          </Col>
          <Col xs={3}>
            <Row>
            <TeamSelect />
            
            </Row>
          </Col>
        </Row>
        <Row className="mx-0"><Col className="p-0">
          <Collapse in={view.showPostTeam}>
            <Row><Col>
              <TeamForm />
            </Col></Row>
          </Collapse>
          {/* <Jumbotron className="bg-dark py-5 mt-3"> */}
          <Collapse in={!view.showTeamView}>
            <Row className="justify-content-center text-center mt-5"><Col>

            <h2>Please select a team or create one</h2></Col></Row>
          </Collapse>
          <Collapse in={view.showTeamView}>
            <div>
              <h2>Available Times</h2>
              <Row className="mx-lg-0 my-4 justify-content-around">
                <TeamScheduleView />
              </Row>
              <Row>
                <Col><h3>Members</h3></Col>
              </Row>
              <TeamMembersView />
              </div>
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
  return !teamSchedule ? "" : parseSchedule({ schedule: teamSchedule, formatTime: toDisplayTime }).map(d => {
    return (
      <Card key={d.day} bg="info" className="mx-1"style={{width: '10rem', marginBottom: '1rem'}} id="schedule">
        <Card.Header className="text-center"><h3>{d.day}</h3></Card.Header>
        <Card.Body variant="flush">
        <h4 className="mb-3">{d.start}</h4>
        <h4 className="mb-0">{d.end}</h4>
        </Card.Body>
      </Card>
    )
  })
}

function TeamMembersView() {
  let teamCtx = useTeam()
  const { teamMembers } = teamCtx

  const content = teamMembers.map(m => { return (<Col key={m.email} xs={12}>
    {m.email}</Col>
  )})

  return <Row>
    <Col>
      <Row className="mb-3">
      {content}
      </Row>
      <PostMemberForm />
    </Col>
  </Row>
}

export default TeamView