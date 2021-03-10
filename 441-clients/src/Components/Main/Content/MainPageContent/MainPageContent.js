import React, { Component } from 'react';
import{NavLink} from 'react-router-dom';
import PageTypes from '../../../../Constants/PageTypes/PageTypes';
import './Styles/MainPageContent.css';
import api from '../../../../Constants/APIEndpoints/APIEndpoints';

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
            schedule: "You haven't add your schedule yet"
        }
        this.getSchedule()
    }

    process(data) {
        
    }

    getSchedule = async () => {
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

        const scheduleElements = scheduleArr.map(d => {
            return <div>
                <h1>{d.day}</h1>
                <h2>{d.startTime}</h2>
                <h2>{d.endTime}</h2>
            </div>
        })

        this.setState({schedule: scheduleElements})
    }

    render() {
        return (
            <div>
                <div>Welcome to my application, {this.props.user.firstName} {this.props.user.lastName}</div>
                <div>
                    {this.state.schedule}
                </div>
            </div>
        );
    }
}

export default MainPageContent;