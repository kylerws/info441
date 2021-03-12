import React, { Component } from 'react'
import { Button, Col, Container, Row, Jumbotron, Form } from 'react-bootstrap'
import moment from 'moment'

import api from '../../../Constants/APIEndpoints/APIEndpoints';

const defaultTeamOption = { label: "Select a team", value: "" }

class MainPageContent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            schedule: "",
            showPostSchedule: false,
            shotPostTeam: false,
            teamOptions: [defaultTeamOption],
            teamID: "",
            teamName: "",
            day: "sunday",
            startTime: 9,
            endTime: 5
        }

        this.getSchedule()
        this.getTeams()
        // this.getTeamSchedule()
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
    
        const schedules = await resp.json()
        if (schedules.length == 0) {
            this.setState({schedule: (<h3>When are you free?</h3>)})
            return
        }

        console.log(schedules[0])
        const scheduleElements = schedules.map(d => {
            return <div key={d.day}>
                <h3>{toUpper(d.day)}</h3>
                <h4>{toClientDate(d.startTime)}</h4>
                <h4>{toClientDate(d.endTime)}</h4>
            </div>
        })

        this.setState({schedule: scheduleElements})
    }

    postSchedule = async (e) => {
        
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

    
    ////// WORKING HERE //////

    // Gets all teams for user
    getTeams = async () => {
        console.log("GET /teams")

        const resp = await fetch(api.base + api.handlers.teams, {
            headers: new Headers({
                "Authorization": this.props.auth
            }),
        })

        if (resp.status !== 200) {
            // alert("No teams found for user")
            return
        }

        const teams = await resp.json()
        if (teams.length == 0) {
            this.setState({teams})
            return
        }

        const teamOptions = teams.map(d => {
            return { label: d.teamName, value: d.id, desc: d.desc }
        })

        teamOptions.unshift(defaultTeamOption)
        this.setState({teamOptions})
    }

    // Creates team for the current user
    postTeam = async (e) => {
        e.preventDefault()
        console.log("POST /teams called")
        // this.setState({showPostSchedule: true})

        console.log(this.state.newTeamName)

        const { name, description } = {
            name: this.state.newTeamName,
            description: this.state.newTeamDesc
        }

        console.log("reached sendData")
        const sendData = { name, description }
        console.log(sendData)
        const resp = await fetch(api.base + api.handlers.teams, {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: new Headers({
                "Authorization": this.props.auth,
                "Content-Type": "application/json"
            })
        })

        console.log(resp.status)
        console.log(resp.body)

        if (resp.status !== 201) {
            alert("Failed to create team")
            return
        }

        console.log("got response")
        const createdTeam = await resp.json()
        if (createdTeam === null) {
            console.log("New team not returned by service")
            alert("Unable to display team")
            return
        }

        // Update teams
        this.getTeams()
        
        // Hide form
        this.setState({showPostTeam: false})
    }

    // Get selected team schedule
    getTeamSchedule = async (teamID) => {
        console.log("GET /teams/teamID")
        if (teamID === "") {
            this.setState({teamSchedule: ""})
            return
        }

        const path = api.base + api.handlers.teams + "/" + teamID

        const resp = await fetch(path, {
            headers: new Headers({
                "Authorization": this.props.auth
            })
        })
        
        if (resp.status !== 200) {
            if (resp.status === 409) {
                alert("Team name already in use, please try another")
            }
            return
        }
        
        const teamSchedules = await resp.json()
        if (teamSchedules.length === 0) {
            console.log("no team was added")
            this.setState({teamSchedule: ""})
            return
        }

        const teamScheduleElements = teamSchedules.map(d => {
            console.log(d)
            return (
                <div key={d.day}>
                    <div className="col-xl"><h3>{toUpper(d.day)}</h3></div>
                    <div className="col-xl"><h4>{toClientDate(d.startTime)}</h4></div>
                    <div className="col-xl"><h4>{toClientDate(d.endTime)}</h4></div>
                </div>
            )
        })
        
        this.setState({teamSchedule: teamScheduleElements})
    }

    // Handles a new selection of team from the TeamSelect
    onTeamChange = (team) => {
        console.log("teamChangeCalled")
        console.log(team)
        
        // TODO: handle unselect team
        if (!team) {
            console.log("default blocked")
            return
        }

        this.setState({teamID: team.id})
        this.setState({teamName: team.teamName})
        // this.setState({teamDesc: team.desc})
        this.getTeamSchedule(team.id)
        this.getTeamMembers(team.id)
    }

    getTeamMembers = async (teamID) => {
        if (teamID == "") {
            return
        }
        
        const resp = await fetch(api.base + api.handlers.teams + "/" + teamID + "/members", {
            headers: new Headers({
                "Authorization": this.props.auth
            })
        })

        if (resp.status !== 200) {
            return
        }

        const teamMembers = await resp.json()
        if (teamMembers.length === 0) {
            this.setState({members: ""})
            return
        }

        const teamMembersElements = teamMembers.map(t => {
            console.log(t)
            return (
                <Row>
                    <Col><h3>ID: {t.id}</h3></Col>
                    <Col><h4>Email: {t.email}</h4></Col>
                </Row>
            )
        })

        this.setState({teamMembers: teamMembersElements})
    }

    //get team members from tea with teamID in url
    postTeamMembers = async (e) => {
        e.preventDefault()
        console.log("POST /teamID/members called")
        if (this.state.email == "") {
            return
        }

        const { email } = { email: this.state.newMember }
        console.log(email)

        const sendData = { email }
        const resp = await fetch(api.base + api.handlers.teams + "/" + this.state.teamID + "/members", {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: new Headers({
                "Authorization": this.props.auth,
                "Content-Type": "application/json"
            })
        })

        if (resp.status !== 201) {
            alert("Failed to post member")
        }

        const createdTeam = await resp.json()
        if (createdTeam === null) {
            console.log("New team not returned by service")
            alert("Unable to display team")
            return
        }

        // Update teams
        this.getTeamMembers(this.state.teamID)
        
        // Hide form
        this.setState({showPostMembers: false})
    }

    // devSetupDemo = () => {
    //     console.log("Demo setup started")
    //     dayOptions.forEach((d) => {
    //         this.setState({
    //             day: d.value,
    //             startTime: 9,
    //             endTime: 12
    //         })
    //         this.postSchedule()
    //         console.log(d.value)
    //     })
    // }

    render() {
        // Expand button for postScheduleView
        let openPostScheduleBtn = <Button size="sm" variant="success"
            onClick={() => this.setState({showPostSchedule: true})}>Add availability</Button>

        // Close button for postScheduleView
        let closePostScheduleBtn = <Button size="sm" variant="dark"
            onClick={() => this.setState({showPostSchedule: false})}>Hide</Button>

        // Form for updating user own schedule
        let postScheduleView = (
            <Container fluid={true}>
                <DayForm submit={() => this.postSchedule()}
                    setDay={(v) => this.setState({day: v})}
                    setStart={(v) => this.setState({startTime: v})}
                    setEnd={(v) => this.setState({endTime: v})} />
            </Container>
        )

        // Form for creating team
        let postTeamView = (
            <div>
                <TeamForm submit={e => this.postTeam(e)}
                    setName={(v) => this.setState({newTeamName: v})}
                    setDesc={(v) => this.setState({newTeamDesc: v})} />
                <Button variant="success" size="sm"
                    onClick={() => this.setState({makingTeam: false})}>Cancel</Button>
            </div>
        )

        // Form to add member
        let postMemberView = (
            <div>
                <AddMemberForm submit={e => this.postTeamMembers(e)}
                    setMember={(v) => this.setState({newMember: v})} />
                {/* <Button variant="success" size="sm"
                    onClick={() => this.setState({showPostMembers: false})}>Cancel</Button> */}
            </div>
        )

        let welcomeName = this.props.user.firstName && this.props.user.lastName ?
            this.props.user.firstName + " " + this.props.user.lastName : this.props.user.userName

        let devKey = "dev"
        let devBtn = <Button variant="warning" onClick={() => this.devSetupDemo()}>SET UP DEMO</Button>

        return (
            <div>
                <Jumbotron fluid={true} className="mb-0">
                    <Container fluid={true} className="px-5">
                        <div>Welcome back, {welcomeName} </div>
                        <Row className="justify-content-between">
                            <Col xs={9}><h1>Your Schedule</h1></Col>
                            <Col>{this.props.user.userName === devKey && this.props.user.firstName == devKey ? devBtn : ""}</Col>
                            {/* <button onClick={() => this.getSchedule()}>Refresh</button> */}
                        </Row>
                        <Row className="px-3 my-4 justify-content-around">
                            {this.state.schedule}
                        </Row>

                        <Row className="justify-content-between">
                            {/* <Col xs={3}><h1>Your Schedule</h1></Col> */}
                            <Col xs={1} className="mt-2">
                                {this.state.showPostSchedule ? closePostScheduleBtn : openPostScheduleBtn}
                            </Col>
                            <Col>
                                {this.state.showPostSchedule ? postScheduleView : ""}
                            </Col>
                        </Row>
                    </Container>
                </Jumbotron>
                <Jumbotron fluid={true} className="bg-dark text-light mb-0">
                <Container fluid={true} className="px-5">
                    <Row className="">
                        <Col>
                            <h1>Team Schedule</h1>
                        </Col>
                        {/* <h3>Team {this.state.teamName}</h3> */}
                        <Col xs={3}>
                            <TeamSelect options={this.state.teamOptions} default={""}
                                update={(t) => this.onTeamChange(t)} />
                                {/* <Select options={hourOptions} default={"2"} update={(v) => this.props.setEnd(v)}/> */}
                        </Col>
                        {/* <button onClick={() => this.getTeamSchedule()}>Refresh</button> */}
                    </Row>
                    <Row className="px-3 my-4 justify-content-around">
                        {this.state.teamSchedule}
                    </Row>
                    <Row className="justify-content-between">
                        <Col xs={1} className="mt-2">
                            {/* {this.state.showPostSchedule ? closePostScheduleBtn : openPostScheduleBtn} */}
                            <Button size="sm" variant="success"
                                onClick={() => this.setState({showPostTeam: true})}>Create a Team</Button>
                        </Col>
                        <Col>
                            {this.state.showPostTeam ? postTeamView : ""}
                        </Col>
                    </Row>

                    <Row className="">
                        <Col><h1>Team Members</h1></Col>
                    </Row>
                    <Row>
                        <Col>{this.state.teamMembers}</Col>
                    </Row>
                    <Row>
                        {postMemberView}
                    </Row>
                </Container>
                </Jumbotron>
            </div>
        );
    }
}


////// Extra Components //////

class AddMemberForm extends Component {
    render() {
        return(
            <form key="addmemberform" onSubmit={this.props.submit} id="addmemberform">
                <div>
                    <label>New member email: </label>
                    <input type="text" onChange={(e) => this.props.setMember(e.target.value)}/>                   
                </div>
                <input type="submit" value="Add" />
            </form>
        )
    }
}

// Form for adding Day to schedule
class DayForm extends Component {
    render() {
        return (
            <Form onSubmit={this.props.submit}>
                <Form.Row className="justify-content-end">
                    <Form.Group as={Col} xs={3}>
                        <Form.Label>Day to set availability</Form.Label>
                        <Select options={dayOptions} default={"sunday"} update={(v) => this.props.setDay(v)}/>
                    </Form.Group>
                    <Form.Group as={Col} xs={2}>
                        <Form.Label>Start Time</Form.Label>
                    <Select options={hourOptions} default={9} update={(v) => this.props.setStart(v)}/>
                    </Form.Group>
                    <Form.Group as={Col} xs={2}>
                        <Form.Label>End Time</Form.Label>
                        <Select options={hourOptions} default={12} update={(v) => this.props.setEnd(v)}/>
                    </Form.Group>
                    
                </Form.Row>
                <Form.Row className="justify-content-end">
                    <Button type="submit" size="sm" variant="outline-success">Add to Schedule</Button>
                </Form.Row>
            </Form>
        )
    }
}

//
class TeamForm extends Component { //= ({ setField, submitForm, values, fields }) => {
    render() {
        return(
            <form key="teamform" onSubmit={this.props.submit} id="maketeamform">
                <div>
                    <label>Team name: </label>
                    <input type="text" onChange={(e) => this.props.setName(e.target.value)}/>
                    <label>Team members: </label>
                    <input type="text" onChange={(e) => this.props.setDesc(e.target.value)}/>
                   
                </div>
                <input type="submit" value="Submit" />
            </form>
        )
    }
}

// Select input that lifts selected value up
class Select extends Component {
    constructor(props) {
        super(props)
        this.state = { selected: this.props.default }
        this.props.update(this.state.selected)
    }

    handleChange = (e) => {
        e.preventDefault()
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

// Custom Select for teams that overloads the handle method
class TeamSelect extends Select {
    // constructor(props) {
    //     super(props)
    //     // this.setState({selected: this.props.default})
    // }

    handleChange = (e) => {
        console.log("teamSelect handle called")
        e.preventDefault()

        let index = e.nativeEvent.target.selectedIndex
        let teamName = e.nativeEvent.target[index].text
        let id = e.target.value

        this.setState({ selected: id })
        this.props.update({ id, teamName })
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
    console.log("Got: " + hour)
    var test = moment({'year': 1998, 'month': 0, 'date': 1, 'hour': hour, 'minute': 0}).toISOString()
    console.log("Converted to: " + test)
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
    { label: "End of Day", value: 24 }
  ];

export default MainPageContent;