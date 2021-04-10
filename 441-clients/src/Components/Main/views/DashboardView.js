import React, { Component } from 'react'
import { Button, Col, Container, Row, Jumbotron, Form, Card, Collapse } from 'react-bootstrap'
import moment from 'moment'

import api from '../../../constants/APIEndpoints';
import { CustomSelect as Select } from '../components/Inputs'
import Schedule from '../components/Schedule'

import { days, times, dayIDs } from '../../../constants/AvailabilityTypes'

const defaultTeamOption = { label: "Select a team", value: "" }

class MainPageContent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scheduleView: "",
      showPostSchedule: false,
      shotPostTeam: false,
      teamOptions: [defaultTeamOption],
      teamID: "",
      teamName: "",
      day: "sunday",
      startTime: 9,
      endTime: 5
    }
  }

  componentDidMount() {
    this.getSchedule()
  }

  getSchedule = async () => {
    console.log("GET /schedule")
    const resp = await fetch(api.base + api.handlers.schedule, {
      headers: new Headers({
          "Authorization": this.props.auth
      })
    })

    if (resp.status !== 200) {
      if (resp.status === 404) return
      alert(resp.body)
      return
    }

    const schedule = await resp.json()
    if (schedule.length === 0) {
      this.setState({scheduleView: (<h3>When are you free?</h3>)})
      return
    }

    console.log(schedule[0])
    const scheduleElements = schedule.map(d => {
      return <Card key={d.day} bg="dark" text="light" className="" style={{minWidth: '5rem'}}>
        <Card.Header className="text-center"><h3>{toUpper(d.day)}</h3></Card.Header>
        <Card.Body>
        <h4 className="mb-3">{toClientDate(d.startTime)}</h4>
        <h4 className="mb-0">{toClientDate(d.endTime)}</h4>
        </Card.Body>
      </Card>
    })

    this.setState({ schedule: parseSchedule(schedule, toGridTime) })
    this.setState({scheduleView: scheduleElements})
  }

  postSchedule = async () => {
    console.log("POST /schedule")
    // Get form values from state
    const { day, startTime, endTime } = {
        day: this.state.day,
        startTime: toMongoDate(this.state.startTime),
        endTime: toMongoDate(this.state.endTime)
    }

    // Arrange into object to be JSON parsed
    const sendData = { day, startTime, endTime }

    // POST to /v1/schedule
    const resp = await fetch(api.base + api.handlers.schedule, {
        method: "POST",
        body: JSON.stringify(sendData),
        headers: new Headers({
            "Authorization": this.props.auth,
            "Content-Type": "application/json"
        })
    })

    if (resp.status !== 201) {
        console.log(resp.status)
        console.log(sendData)
        alert("Unable to add to schedule")
        
    }

    this.getSchedule()  // update displayed schedule
    this.setState({showPostSchedule: false})    // hide postSchedule form
  }

  handlePostSchedule = (e) => {
    e.preventDefault()
    this.postSchedule()
    return false
  }

  render() {
    // Expand button for postScheduleView
    let openPostScheduleBtn = <Button size="sm" variant="success" className="ml-sm-auto flex-grow-1 flex-sm-grow-0 mt-3 mt-sm-0"
      onClick={() => this.setState({showPostSchedule: true})}>Add availability</Button>

    // Close button for postScheduleView
    let closePostScheduleBtn = <Button size="sm" variant="dark" className="ml-sm-auto mt-3 mt-sm-0 flex-grow-1 flex-sm-grow-0 "
      onClick={() => this.setState({showPostSchedule: false})}>Hide</Button>

    // Form for updating user own schedule
    let postScheduleView = (
      <Col lg={8} xl={6} className="mb-3">
        <DayForm submit={(e) => this.handlePostSchedule(e)}
          setDay={(v) => this.setState({day: v})}
          setStart={(v) => this.setState({startTime: v})}
          setEnd={(v) => this.setState({endTime: v})} />
      </Col>
    )
    
    return (
      <Jumbotron fluid={true} className="mb-0 pb-4 mt-5 mt-sm-3">
        <Container fluid={true} className="px-3">
          <Row className="align-items-baseline mx-0 mb-3">
            <CustomCol xs={12} md={"auto"}><h1 className="mb-0">Schedule</h1></CustomCol>
            <CustomCol xs={12} sm={"auto"}><h2 className="mb-0 ml-0 ml-md-3">When are you available?</h2></CustomCol>
            <CustomCol css="align-self-center d-flex justify-content-center">
              {this.state.showPostSchedule ? closePostScheduleBtn : openPostScheduleBtn} </CustomCol>
          </Row>
          <Row className="justify-content-end">
            <Collapse in={this.state.showPostSchedule}>
              
              {postScheduleView}
            </Collapse>
          </Row>
          <Schedule id="my-schedule" schedule={this.state.schedule} />
        </Container>
      </Jumbotron>
    );
  }
}

const CustomCol = ({children, css, ...rest}) => {
  return <Col {...rest} className={"px-0 " + css}>{children}</Col>
}

////// Extra Components //////

// Form for adding Day to schedule
class DayForm extends Component {
  render() {
    return (
      <Form onSubmit={this.props.submit}>
        <Form.Row className="justify-content-center justify-content-lg-end">
          <Form.Group as={Col} xs={12} sm={5}>
            <Form.Label>Day to Add</Form.Label>
            <Select options={dayOptions} default={"sunday"} update={(v) => this.props.setDay(v)}/>
          </Form.Group>
          <Form.Group as={Col} xs={6} sm={2}>
            <Form.Label>Start Time</Form.Label>
          <Select options={hourOptions} default={9} update={(v) => this.props.setStart(v)}/>
          </Form.Group>
          <Form.Group as={Col} xs={6} sm={2}>
            <Form.Label>End Time</Form.Label>
            <Select options={hourOptions} default={17} update={(v) => this.props.setEnd(v)}/>
          </Form.Group>    
          <Form.Group as={Col} xs={12} sm={"auto"} className="align-self-end">
        {/* <Form.Row className="justify-content-center justify-content-sm-end mx-0"> */}
          <Button type="submit" variant="outline-success">Add</Button>
          </Form.Group>
          </Form.Row>
      </Form>
    )
  }
}

function parseSchedule(schedule, formatTime) {
  if (!schedule)
    return

  schedule = schedule.map(d => {
    return {id: dayIDs[d.day], start: formatTime(d.startTime), end: formatTime(d.endTime)}
  })

  days.forEach(d => {
    if (schedule.filter(e => e.id === d.id).length === 0) {
      schedule.push({id: d.id})
    }
  })

  schedule.sort((a, b) => a.id - b.id)

  return schedule
}

const toGridTime = (datetime) => {
  return parseInt(moment(datetime).local().format('H'))
}
 
// Returns capitalized version of string
function toUpper(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Takes DateTime returned by mongoDB and parses to a readable format
function toClientDate(datetime) {
  return moment(datetime).local().format('h:mm a')
}

// Takes hour as int and convert to ISO UTC format for mongoDB
function toMongoDate(hour) {
  console.log("Got: " + hour)
  const local = moment({'year': 1998, 'month': 0, 'date': 1, 'hour': hour, 'minute': 0})
  console.log(local)
  var test = local.toISOString()
  // var test = moment({'year': 1998, 'month': 0, 'date': 1, 'hour': hour, 'minute': 0}).toISOString()
  // console.log("Tried to convert to: " + test)
  console.log(test)
  console.log(local.toISOString())
  console.log(local.toString())
  return test
}

// Options for day select in postScheduleView
const dayOptions = [
  { label: "Sunday", value: "sunday", abbr: "SUN", id: 0 },
  { label: "Monday", value: "monday", abbr: "MON", id: 1 },
  { label: "Tuesday", value: "tuesday", abbr: "TUE", id: 2},
  { label: "Wednesday", value: "wednesday", abbr: "WED", id: 3},
  { label: "Thursday", value: "thursday", abbr: "THU", id: 4},
  { label: "Friday", value: "friday", abbr: "FRI", id: 5},
  { label: "Saturday", value: "saturday", abbr: "SAT", id: 6},
]


// Options for hour select in postScheduleView
const hourOptions = [
  { label: "12 AM", value: 0 },
  { label: "1 AM", value: 1 },
  { label: "2 AM", value: 2 },
  { label: "3 AM", value: 3 },
  { label: "4 AM", value: 4 },
  { label: "5 AM", value: 5 },
  { label: "6 AM", value: 6 },
  { label: "7 AM", value: 7 },
  { label: "8 AM", value: 8 },
  { label: "9 AM", value: 9 },
  { label: "10 AM", value: 10 },
  { label: "11 AM", value: 11 },
  { label: "12 PM", value: 12 },
  { label: "1 PM", value: 13 },
  { label: "2 PM", value: 14 },
  { label: "3 PM", value: 15 },
  { label: "4 PM", value: 16 },
  { label: "5 PM", value: 17 },
  { label: "6 PM", value: 18 },
  { label: "7 PM", value: 19 },
  { label: "8 PM", value: 20 },
  { label: "9 PM", value: 21 },
  { label: "10 PM", value: 22 },
  { label: "11 PM", value: 23 },
  // { label: "12 AM", value: 24 }
];

export default MainPageContent;