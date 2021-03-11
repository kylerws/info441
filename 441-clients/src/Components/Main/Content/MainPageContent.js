import React, { Component } from 'react'
import { Button, Col, Container, Row, Form } from 'react-bootstrap'
import moment from 'moment'

import api from '../../../Constants/APIEndpoints/APIEndpoints';

class MainPageContent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            schedule: "",
            showPostSchedule: false,
            teamID: "6048ee62bc524b5c2d58f9f4",
            teamName: 
            teamList: []
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

        if (resp.status !== 200) {
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

        if (resp.status !== 201) {
            alert("Failed to update schedule")
            return
        }

        this.getSchedule()  // update displayed schedule
        this.setState({showPostSchedule: false})    // hide postSchedule form
    }

    // getTeamID() {
    //     // get id
        
    //     getSpecificTeam(id)
    // }

    postTeam = async (e) => {
        e.preventDefault()

        // this.setState({showPostSchedule: true})

        const { name, description } = {
            name: this.state.teamName,
            description: this.state.members
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

        if (resp.status !== 201) {
            alert("Failed to create team")
            return
        }
        // resp body will contain an id field, set this in the stat
        const teamID = resp.body.id
        // this.setState({showPostSchedule: false})
    }



    ////// WORKING HERE //////

    // Get teamID by team name
    getTeamIDByName = async () => {
        console.log("GET /teams")

        const resp = await fetch(api.base + api.handlers.teams, {
            headers: new Headers({
                "Authorization": this.props.auth
            }),
            param: JSON.stringify({name: this.state.teamName})
        })

        // if (resp.status !== 200) {
        //     alert("Failed to get team with that name")
                // return
        // }

        const parsed = await resp.json()
        if (parsed.length == 0) {
            this.setState({schedule: (<h3>When are you free?</h3>)})
            return
        }

        console.log(parsed)
        // const scheduleElements = scheduleArr[0].schedule.map(d => {
        //     return <div key={d.day}>
        //         <h3>{toUpper(d.day)}</h3>
        //         <h4>{toClientDate(d.startTime)}</h4>
        //         <h4>{toClientDate(d.endTime)}</h4>
        //     </div>
        // })

        // this.setState({teamID})
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
        
        if (resp.status !== 200) {
            return
        }
        
        const teamArr = await resp.json()
        if (teamArr.length === 0) {
            this.setState({team: ""})
            return
        }

        console.log(teamArr)
        const teamScheduleElements = teamArr[0].schedule.map(d => {
            console.log(d)
            return <div class="container"><div class="row">
                <div className="row" id="oneDayAvailability" key={d.day}>
                    <div className="col-xl"><h3>{toUpper(d.day)}</h3></div>
                    <div className="col-xl"><h4>{toClientDate(d.startTime)}</h4></div>
                    <div className="col-xl"><h4>{toClientDate(d.endTime)}</h4></div>
                </div>
            </div></div>
        })

        // teamID hardcoded for now
        this.setState({teamName: teamArr[0].name})
        this.setState({teamSchedule: teamScheduleElements})
    }


    render() {
        // Expand button for postScheduleView
        let openPostScheduleBtn = <Button size="sm" variant="success"
            onClick={() => this.setState({showPostSchedule: true})}>Add availability</Button>

        // Close button for postScheduleView
        let closePostScheduleBtn = <Button size="sm" variant="dark"
            onClick={() => this.setState({showPostSchedule: false})}>Hide</Button>

        // Form for updating user own schedule
        let postScheduleView = (
            <div>
                
                <DayForm submit={e => this.postSchedule(e)}
                    setDay={(v) => this.setState({day: v})}
                    setStart={(v) => this.setState({startTime: v})}
                    setEnd={(v) => this.setState({endTime: v})} />
                
                {/* <button onClick={e => this.postSchedule(e)}>Post Schedules</button> */}
            </div>
        )

        // Form for creating team
        let makeTeamView = (
            <div>
                <TeamForm submit={e => this.postTeam(e)}
                    setTeamName={(v) => this.setState({teamName: v})}
                    setTeamMembers={(v) => this.setState({members: v})}
                    setTeamPrivacy={(v) => this.setState({teampriv: v})}
                />
                <button onClick={() => this.setState({makingTeam: false})}>Cancel</button>
            </div>
        )

        return (
            <div>
                <Container>
                    <div>Welcome back, {this.props.user.firstName} {this.props.user.lastName}</div>
                    <h1>Your Schedule</h1>
                    {/* <button onClick={() => this.getSchedule()}>Refresh</button> */}
                    <Row>
                        {this.state.schedule}
                    </Row>
                </Container>
                <Container>
                    <Row className="">
                        {this.state.showPostSchedule ? closePostScheduleBtn : openPostScheduleBtn}
                    </Row>
                    <Row className="p-5">
                        {this.state.showPostSchedule ? postScheduleView : ""}
                    </Row>
                </Container>
                <Container>
                    <Row>
                        <Col>
                            <h1>Team Schedule</h1>
                            <h3>Team {this.state.teamName}</h3>
                        </Col>
                        {/* <button onClick={() => this.getTeamSchedule()}>Refresh</button> */}
                        {this.state.teamSchedule}
                    </Row>
                    <Row>
                        <Button size="sm" variant="success"
                            onClick={() => this.setState({makingTeam: true})}>Create a Team</Button>
                    </Row>
                    <Row>
                        {this.state.makingTeam ? makeTeamView : ""}
                    </Row>
                </Container>
            </div>
        );
    }
}


////// Extra Components //////

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

class TeamForm extends React.Component { //= ({ setField, submitForm, values, fields }) => {
    render() {
        return(
            <form key="teamform" onSubmit={this.props.submit} id="maketeamform">
                <div>
                    <label for="teamname">Team name: </label>
                    <input type="text" onChange={(v) => this.props.setTeamName(v)}/>
                    <label for="teammembers">Team members: </label>
                    <input type="text" onChange={(v) => this.props.setTeamMembers(v)}/>
                   
                </div>
                <input type="submit" value="Submit" />
            </form>
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