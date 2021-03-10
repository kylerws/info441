import React, { Component } from 'react';
import{NavLink} from 'react-router-dom';
import PageTypes from '../../../../Constants/PageTypes/PageTypes';
import './Styles/MainPageContent.css';
import api from '../../../../Constants/APIEndpoints/APIEndpoints';
import moment from 'moment'

// const MainPageContent = ({ user, setPage }) => {

//     return <>
//         <div>Welcome to my application, {user.firstName} {user.lastName}</div>

//         {/* {avatar && <img className={"avatar"} src={avatar} alt={`${user.firstName}'s avatar`} />} */}
//         {/* <div><button>My Teams</button></div> */}
//         <div><button>POST /schedule</button></div>
//         <div><button onClick={(e) => { setPage(e, PageTypes.signedInUpdateName) }}>My Profile</button></div>
//         {/* <nav id="aboutLinks">
//             <ul className="list-unstyled">
//                 <li><a to="/teams" activeClassName="activeLink">Your Teams</a></li>
//             </ul>
//         </nav> */}
//     </>
// }

class MainPageContent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            schedule: "",
            showPostSchedule: false
        }

        this.getSchedule()
    }

    process(data) {
        
    }

    getSchedule = async () => {
        console.log("clicked")
        const resp = await fetch(api.base + api.handlers.schedule, {
            headers: new Headers({
                "Authorization": this.props.auth
            })
        })
        // .then(resp => {
        //     if (resp.status == 200) {
        //         const scheduleArr = resp.json()
        //         if (scheduleArr.length == 0) {
        //             return "You haven't added your schedule yet"
        //         }
        //         process(scheduleArr)
        //     }
        // })
        if (resp.status != 200) {
            return
        }
        
        const scheduleArr = await resp.json()
        if (scheduleArr.length == 0) {
            this.setState({schedule: "You haven't add your schedule yet"})
            return
        }

        console.log(scheduleArr)
        const scheduleElements = scheduleArr[0].schedule.map(d => {
            console.log(d)
            // console.log
            // moment(d.startTime).local().format('HH:mm')
            return <div key={d.day + "test"}>
                <h1>{toUpper(d.day)}</h1>
                <h2>{moment(d.startTime).local().format('h:mm a')}</h2>
                <h2>{moment(d.endTime).local().format('h:mm a')}</h2>
            </div>
        })

        this.setState({schedule: scheduleElements})
    }

    postSchedule = async (e) => {
        e.preventDefault()
        // this.setState({showPostSchedule: true})

        // t = moment()

        const { day, startTime, endTime } = 
            {day: "test2",
            startTime:  normalizeDate(new Date("2018-03-29T08:00:00.000")),
            endTime: normalizeDate(new Date("2018-03-29T10:00:00.000"))
        }

        console.log(endTime)
        // startTime = normalizeDate(new Date(startTime))
        // endTime = normalizeDate(new Date(endTime))
        // let d = new Date(startTime)
        // d.setFullYear(1998)
        // // d.setMonth(0)
        // d.setMonth(1)
        // d.setDate(1)
        // console.log(d)

        const sendData = { day, startTime, endTime }
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

        this.getSchedule()
        this.setState({showPostSchedule: false})
    }

    render() {
        let postScheduleView = (
            <div>
               
                <button onClick={() => this.setState({showPostSchedule: false})}>Cancel</button>
                <button onClick={e => this.postSchedule(e)}>Post Schedules</button>
            </div>
        )

        return (
            <div>
                <div>Welcome back, {this.props.user.firstName} {this.props.user.lastName}</div>
                <div>
                    <h1>Your Schedule</h1>
                    <button onClick={() => this.getSchedule()}>Refresh</button>
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

// PostSchedule
// class PostScheduleForm extends Component {
//     // static propTypes = {
//     //     setPage: PropTypes.func,
//     //     setAuthToken: PropTypes.func
//     // }

//     constructor(props) {
//         super(props);

//         this.state = {
//             day: "",
//             startTime: "",
//             endTime: "",
//             error: ""
//         };

//         this.fields = [
//             {
//                 name: "Day of Week",
//                 key: "day"
//             },
//             {
//                 name: "Start Time",
//                 key: "startTime"
//             },
//             {
//                 name: "End Time",
//                 key: "endTime"
//             }
//         ];
//     }

//     /**
//      * @description setField will set the field for the provided argument
//      */
//     setField = (e) => {
//         this.setState({ [e.target.name]: e.target.value });
//     }

//     /**
//      * @description setError sets the error message
//      */
//     setError = (error) => {
//         this.setState({ error })
//     }

//     /**
//      * @description submitForm handles the form submission
//      */
//     submitForm = async (e) => {
//         e.preventDefault();
//         const { email, password } = this.state;
//         const sendData = { email, password };
//         const response = await fetch(api.base + api.handlers.sessions, {
//             method: "POST",
//             body: JSON.stringify(sendData),
//             headers: new Headers({
//                 "Content-Type": "application/json"
//             })
//         });
//         if (response.status >= 300) {
//             const error = await response.text();
//             this.setError(error);
//             return;
//         }
//         const authToken = response.headers.get("Authorization")
//         localStorage.setItem("Authorization", authToken);
//         this.setError("");
//         this.props.setAuthToken(authToken);
//         const user = await response.json();
//         this.props.setUser(user);
//     }

//     render() {
//         const values = this.state;
//         const { error } = this.state;
//         return <>
//             <Errors error={error} setError={this.setError} />
//             <SignForm
//                 setField={this.setField}
//                 submitForm={this.submitForm}
//                 values={values}
//                 fields={this.fields} />
//             <button onClick={(e) => this.props.setPage(e, PageTypes.signUp)}>Sign up instead</button>
//             <button onClick={(e) => this.props.setPage(e, PageTypes.forgotPassword)}>Forgot password</button>
//         </>
//     }
// }

// const SignForm = ({ setField, submitForm, values, fields }) => {
//     return <>
//         <form onSubmit={submitForm}>
//             {fields.map(d => {
//                 const { key, name } = d;
//                 return <div key={key}>
//                     <span>{name}: </span>
//                     <input
//                         value={values[key]}
//                         name={key}
//                         onChange={setField}
//                         type={key === "password" || key === "passwordConf" ? "password" : ''}
//                     />
//                 </div>
//             })}
//             <input type="submit" value="Submit" />
//         </form>
//     </>
// }

function toUpper(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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

export default MainPageContent;