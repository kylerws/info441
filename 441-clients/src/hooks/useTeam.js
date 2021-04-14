import React, { useState, useEffect, useContext, createContext } from 'react'
import { useAuth } from './useAuth'
import api from '../constants/APIEndpoints'


// Team Context
const teamContext = createContext();

// Team Context Provider
export function TeamProvider({ children }) {
  const team = useProvideTeam()
  return <teamContext.Provider value={team}>{children}</teamContext.Provider>
}

// Hook for child components
export const useTeam = () => {
  return useContext(teamContext);
}

// Defines state and methods for context
function useProvideTeam() {
  let auth = useAuth()
  
  const [teams, setTeams] = useState()
  const [teamID, setTeamID] = useState("")
  const [team, setTeam] = useState()
  const [teamSchedule, setTeamSchedule] = useState([])
  const [teamMembers, setTeamMembers] = useState([])

  const getTeams = async () => {
    console.log("GET /teams called")
    const endpoint = api.base + api.handlers.teams
    const authHeader = { headers: new Headers({ "Authorization": auth.authToken }) }

    await fetch(endpoint, authHeader)
      .then(resp => resp.json())
      .then(body => setTeams(body))
      .catch(e => console.log(e))
  }

  const postTeam = async (name, description) => {
    console.log("Creating new team")

    const sendData = { name, description }
    const resp = await fetch(api.base + api.handlers.teams, {
        method: "POST",
        body: JSON.stringify(sendData),
        headers: new Headers({
            "Authorization": auth.authToken,
            "Content-Type": "application/json"
        })
    })

    if (resp.status !== 201) {
        alert(resp.body)
        return
    }

    const createdTeam = await resp.json()
    if (createdTeam === null) {
        console.log("New team not returned by service")
        return
    }

    // Update teams
    getTeams()
  }

  const getSelectedTeam = async () => {
    console.log("GET /teams/teamID")
    if (teamID === "") {
      setTeamSchedule([])
      return
    }

    const path = api.base + api.handlers.teams + "/" + teamID
    const params = { headers: new Headers({ "Authorization": auth.authToken }) }
    
    const resp = await fetch(path, params)
    
    if (resp.status !== 200) {
        if (resp.status === 409) {
            alert("Team name already in use, please try another")
        }
        return
    }
    
    const team = await resp.json()
    if (!team) return
    if (team.schedule.length === 0) {
        console.log("No availablity for team")
        setTeamSchedule([])
        return
    }

    console.log(team)
    setTeam(team)
    setTeamSchedule(team.schedule)
    setTeamMembers(team.members)
  }

  // const getMembers = async () => {
  //   console.log("Get members called")
  //   if (teamID === "") {
  //     setTeamMembers([])
  //     console.log("team ID null")
  //     return
  //   }

  //   const path = api.base + api.handlers.teams + "/" + teamID + "/members"
  //   console.log(path)
    
  //   const resp = await fetch(path, {
  //       headers: new Headers({ "Authorization": auth.authToken }) })


  //   console.log(teamID)
  //   if (resp.status !== 200) {
  //       if (resp.status === 404) {
  //           console.log("No members found for teamID")
  //           return
  //       }
  //       console.log(resp.body)
  //       return 
  //   }

  //   const members = await resp.json()
  //   setTeamMembers(members)
  // }

  const postTeamMember = async (email) => {
    console.log("POST new member called")
    if (email === "") {
      return
    }

    const resp = await fetch(api.base + api.handlers.teams + "/" + teamID, {
        method: "POST",
        body: JSON.stringify({email}),
        headers: new Headers({
            "Authorization": auth.authToken,
            "Content-Type": "application/json"
        })
    })

    if (resp.status !== 201) {
        console.log(await resp.text())
        return
    }

    getSelectedTeam()
  }

  useEffect(() => {(async () => {
    getSelectedTeam()
  })() }, [teamID])

  return { teams, teamID, team, teamSchedule, teamMembers,
    getTeams, postTeam, postTeamMember, setTeamID }
}