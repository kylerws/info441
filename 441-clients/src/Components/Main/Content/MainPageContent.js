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
            teamOptions: [defaultTeamOption],
            teamID: "",
            teamName: "" 
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

        console.log(teams)
        const teamOptions = teams.map(d => {
            return { label: d.teamName, value: d.id }
        })

        teamOptions.unshift(defaultTeamOption)

        this.setState({teamOptions})
    }

    // Get teams 
    getTeamSchedule = async (teamID) => {
        console.log("GET /teams/teamID")
        if (teamID === "") {
            this.setState({teamSchedule: ""})
            return
        }

        const path = api.base + api.handlers.teams + "/" + teamID
        console.log(this.state.teamID)
        console.log(typeof teamID)
        console.log(typeof path)

        const resp = await fetch(path, {
            headers: new Headers({
                "Authorization": this.props.auth
            })
        })

        console.log("resp recieved")
        
        if (resp.status !== 200) {
            return
        }
        
        const teamSchedules = await resp.json()
        if (teamSchedules.length === 0) {
            this.setState({teamSchedule: ""})
            return
        }

        console.log(teamSchedules)
        const teamScheduleElements = teamSchedules.map(d => {
            console.log(d)
            return (
                <Row key={d.day}>
                    <div className="col-xl"><h3>{toUpper(d.day)}</h3></div>
                    <div className="col-xl"><h4>{toClientDate(d.startTime)}</h4></div>
                    <div className="col-xl"><h4>{toClientDate(d.endTime)}</h4></div>
                </Row>
            )
        })

        // teamID hardcoded for now
        
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
        this.getTeamSchedule(team.id)
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
            <Container fluid={true}>
                <DayForm submit={e => this.postSchedule(e)}
                    setDay={(v) => this.setState({day: v})}
                    setStart={(v) => this.setState({startTime: v})}
                    setEnd={(v) => this.setState({endTime: v})} />
            </Container>
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

        let welcomeName = this.props.user.firstName && this.props.user.lastName ?
            this.props.user.firstName + " " + this.props.user.lastName : this.props.user.userName

        return (
            <div>
                <Jumbotron>
                    <Container fluid={true} className="px-5">
                        <div>Welcome back, {welcomeName} </div>
                        <Row className="justify-content-between">
                            <Col xs={3}><h1>Your Schedule</h1></Col>
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
                    <Row className="px-3 my-4">
                        {this.state.teamSchedule}
                    </Row>


                    <Row className="justify-content-end px-5">
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
                        <Select options={hourOptions} default={5} update={(v) => this.props.setEnd(v)}/>
                    </Form.Group>
                    
                </Form.Row>
                <Form.Row className="justify-content-end">
                    <Button type="submit" size="sm" variant="outline-success">Add to Schedule</Button>
                </Form.Row>
            </Form>
        )
    }
}

class TeamForm extends Component { //= ({ setField, submitForm, values, fields }) => {
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

// class TeamSelect extends Component {
//     render() {
//         return(
//             <Select options={this.props.options} default={""} update={(v) => this.props.setTeamID(v)}/>
//         )
//     }

// }

// Select input that lifts selected value up
class Select extends Component {
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

class TeamSelect extends Select {
    constructor(props) {
        super(props)
        // this.setState({selected: this.props.default})
    }

    handleChange = (e) => {
        console.log("teamSelect handle called")
        e.preventDefault()

        let index = e.nativeEvent.target.selectedIndex
        let teamName = e.nativeEvent.target[index].text
        let id = e.target.value

        this.setState({ selected: id })
        this.props.update({ id, teamName })
    }

    // render() {
    //     return(
    //         <Select options={this.props.options} default={""} update={(v) => this.props.setTeamID(v)}/>
    //     )
    // }

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