import React, { Component } from 'react';
import{NavLink} from 'react-router-dom';
import PageTypes from '../../../../Constants/PageTypes/PageTypes';
import './Styles/MainPageContent.css';
import api from '../../../../Constants/APIEndpoints/APIEndpoints';
import moment from 'moment'


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
            this.setState({schedule: "You haven't add your schedule yet"})
            return
        }

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
            startTime: this.state.startTime,
            endTime: this.state.endTime
        }

        // console.log(endTime)

        const sendData = {
            day,
            startTime,
            endTime 
        }

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

    // Get teams/teamID
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
        // Contains form for updating user own schedule
        let postScheduleView = (
            <div>
                <DayForm submit={e => this.postSchedule(e)}
                    setDay={(v) => this.setState({day: v})}
                    setStart={(v) => this.setState({startTime: v})}
                    setEnd={(v) => this.setState({endTime: v})} />
                <button onClick={() => this.setState({showPostSchedule: false})}>Cancel</button>
                <button onClick={e => this.postSchedule(e)}>Post Schedules</button>
            </div>
        )

        return (
            <div>
                <div>Welcome back, {this.props.user.firstName} {this.props.user.lastName}</div>
                <div>
                    <h1>Team Schedule</h1>
                    <h2>Team {this.state.teamName}</h2>
                    {/* <button onClick={() => this.getTeamSchedule()}>Refresh</button> */}
                    {this.state.team}
                </div>
                <div>
                    <h1>Your Schedule</h1>
                    {/* <button onClick={() => this.getSchedule()}>Refresh</button> */}
                </div>
                <div>
                    {this.state.schedule}
                </div>
                <div>
                    <button onClick={() => this.setState({showPostSchedule: true})}>Add availability</button>
                </div>

                <div>
                    {this.state.showPostSchedule ? postScheduleView : ""}
                </div>
            </div>
        );
    }
}

// Form for adding Day to schedule
class DayForm extends React.Component {
    render() {
        return (
            <form onSubmit={this.props.submit}>
                <Select options={dayOptions} default={"monday"} onChange={(v) => this.props.setDay(v)}/>
                <Select options={hourOptions} default={"00:00"} onChange={(v) => this.props.setStart(v)}/>
                <Select options={hourOptions} default={"00:00"} onChange={(v) => this.props.setEnd(v)}/>
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
    }

    handleChange = (e) => {
        this.setState({selected: e.target.value})
        this.props.onChange(e.target.value)
    }

    render() {
        let options = this.props.options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>))
        return (
            <select value={this.state.selected} onChange={(e) => this.handleChange(e)}>
                {options}
            </select>
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

// 
function normalizeDate(d) {
    console.log(d)
    d.setFullYear(1998)
    console.log(d)
    d.setMonth(1)
    console.log(d)
    d.setDate(1)
    console.log(d)
    return d
}

const dayOptions = [
    {
        label: "Monday",
        value: "monday",
    },
    {
    label: "Tuesday",
    value: "tuesday",
    },
    {
    label: "Wednesday",
    value: "wednesday",
    },
    {
    label: "Thursday",
    value: "thursday",
    },
    {
        label: "Friday",
        value: "friday",
    },
]

const hourOptions = [
    { label: "12", value: "00:00" },
    { label: "1", value: "01:00" },
    { label: "2", value: "02:00" },
    { label: "3", value: "03:00" },
    { label: "4", value: "04:00" },
  ];

export default MainPageContent;