import React, { Component } from 'react'
import { Button, Col, Container, Row, Form } from 'react-bootstrap'
import moment from 'moment'

// import PageTypes from '../../../../Constants/PageTypes/PageTypes';
import api from '../../../Constants/APIEndpoints/APIEndpoints';



class MainPageContent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            schedule: "",
            showPostSchedule: false,
            teamID: "6048ee62bc524b5c2d58f9f4"
        }

        this.getSchedule()
        this.getTeamSchedule()
    }


    getSchedule = async () => {
        console.log("GET /schedule")
        const resp = await fetch(api.base + api.handlers.schedule, {
            headers: new Headers({
                "Authorization": this.props.auth
            })
        })

        if (resp.status != 200) {
            return
        }
        
        const scheduleArr = await resp.json()
        if (scheduleArr.length == 0) {
            this.setState({schedule: (<h3>When are you free?</h3>)})
            return
        }

        console.log("User schedule: " + scheduleArr[0].schedule)
        const scheduleElements = scheduleArr[0].schedule.map(d => {
            return <div key={d.day}>
                <h3>{toUpper(d.day)}</h3>
                <h4>{toClientDate(d.startTime)}</h4>
                <h4>{toClientDate(d.endTime)}</h4>
            </div>
        })

        this.setState({schedule: scheduleElements})
    }

    postSchedule = async (e) => {
        e.preventDefault()
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

        if (resp.status != 201) {
            alert("Failed to update schedule")
        }

        this.getSchedule()  // update displayed schedule
        this.setState({showPostSchedule: false})    // hide postSchedule form
    }

    postTeam = async (e) => {
        e.preventDefault()

        // this.setState({showPostSchedule: true})

        console.log(this.props.user)
        const { name, description } = 
            {
                name: "Client Created Team",
                description: "Created by "
            }

        const sendData = { name, description }
        const resp = await fetch(api.base + api.handlers.teams, {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: new Headers({
                "Authorization": this.props.auth,
                "Content-Type": "application/json"
            })
        })

        if (resp.status != 201) {
            alert("Failed to create team")
        }
        // resp body will contain an id field, set this in the stat
        const teamID = resp.body.id
        // this.setState({showPostSchedule: false})
    }


    // Get teams 
    getTeamSchedule = async () => {
        console.log("GET /teams/teamID")

        // ---------------------------teamID needs to be added to state---------------
        const resp = await fetch(api.base + api.handlers.teams + "/" + this.state.teamID, {
            headers: new Headers({
                "Authorization": this.props.auth
            })
        })
        
        if (resp.status != 200) {
            return
        }
        
        const teamArr = await resp.json()
        if (teamArr.length == 0) {
            this.setState({team: ""})
            return
        }

        console.log(teamArr)
        const teamScheduleElements = teamArr[0].schedule.map(d => {
            console.log(d)
            return <div key={d.day}>
                <h3>{toUpper(d.day)}</h3>
                <h4>{toClientDate(d.startTime)}</h4>
                <h4>{toClientDate(d.endTime)}</h4>
            </div>
        })

        // teamID hardcoded for now
        this.setState({teamName: teamArr[0].name})
        this.setState({team: teamScheduleElements})
    }


    render() {
        let openPostScheduleBtn = <Button size="sm" variant="success"
            onClick={() => this.setState({showPostSchedule: true})}>Add availability</Button>

        let closePostScheduleBtn = <Button size="sm" variant="dark"
            onClick={() => this.setState({showPostSchedule: false})}>Hide</Button>

        // Contains form for updating user own schedule
        let postScheduleView = (
            <div>
                
                <DayForm submit={e => this.postSchedule(e)}
                    setDay={(v) => this.setState({day: v})}
                    setStart={(v) => this.setState({startTime: v})}
                    setEnd={(v) => this.setState({endTime: v})} />
                
                {/* <button onClick={e => this.postSchedule(e)}>Post Schedules</button> */}
            </div>
        )

        return (
            <div>
                <div>Welcome back, {this.props.user.firstName} {this.props.user.lastName}</div>
                <Container fluid={true}>
                    <h1>Your Schedule</h1>
                    {/* <button onClick={() => this.getSchedule()}>Refresh</button> */}
                    <Row>
                    {this.state.schedule}
                    </Row>
                </Container>
                <Container fluid={true}>
                    <Row className="">
                        {this.state.showPostSchedule ? closePostScheduleBtn : openPostScheduleBtn}
                    </Row>
                    <Row className="p-5">
                        {this.state.showPostSchedule ? postScheduleView : ""}
                    </Row>
                </Container>
                <div>
                    <h1>Team Schedule</h1>
                    <h2>Team {this.state.teamname}</h2>
                    {/* <button onClick={() => this.getTeamSchedule()}>Refresh</button> */}
                    {this.state.team}
                </div>
            </div>
        );
    }
}

// Form for adding Day to schedule
class DayForm extends React.Component {
    render() {
        return (
            <Form onSubmit={this.props.submit}>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>Day to set availability</Form.Label>
                        <Select options={dayOptions} default={"sunday"} update={(v) => this.props.setDay(v)}/>
                    </Form.Group>
                    <Form.Group as={Col} xs={3}>
                        <Form.Label>Start Time</Form.Label>
                    <Select options={hourOptions} default={"1"} update={(v) => this.props.setStart(v)}/>
                    </Form.Group>
                    <Form.Group as={Col} xs={3}>
                        <Form.Label>End Time</Form.Label>
                        <Select options={hourOptions} default={"2"} update={(v) => this.props.setEnd(v)}/>
                    </Form.Group>
                </Form.Row>
                <Button type="submit" size="sm" variant="outline-success">Add to Schedule</Button>
            </Form>
        )
    }
} 

// Select input that lifts selected value up
class Select extends React.Component {
    constructor(props) {
        super(props)
        this.state = { selected: this.props.default }
        
        this.props.update(this.state.selected)
    }

    handleChange = (e) => {
        this.setState({selected: e.target.value})
        this.props.update(e.target.value)
    }

    render() {
        let options = this.props.options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>))
        return (
            <Form.Control as="select" value={this.state.selected} onChange={(e) => this.handleChange(e)}>
                {options}
            </Form.Control>
        );
    }
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
    var test = moment({'year': 1998, 'month': 0, 'date': 1, 'hour': hour, 'minute': 0}).toISOString()
    console.log(test)
    return test
}

// Options for day select in postScheduleView
const dayOptions = [
    { label: "Sunday", value: "sunday" },
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday"},
    { label: "Wednesday", value: "wednesday"},
    { label: "Thursday", value: "thursday"},
    { label: "Friday", value: "friday", },
    { label: "Saturday", value: "saturday" },
]


// OPtions for hour select in postScheduleView
const hourOptions = [
    { label: "12 AM", value: 0 },
    { label: "1 AM", value: 1 },
    { label: "2 AM", value: 2 },
    { label: "3 AM", value: 3 },
    { label: "4 AM", value: 4 },
    { label: "5 AM", value: 5 },
    { label: "6 AM", value: 6 },
    { label: "11:59 pm", value: 24 }
  ];

export default MainPageContent;