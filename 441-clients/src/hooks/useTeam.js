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
  
  const [teams, setTeams] = useState(null)
  const [teamID, setTeamID] = useState("")
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

  const getSchedule = async () => {
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
    
    const schedule = await resp.json()
    if (schedule.length === 0) {
        console.log("No availablity for team")
        setTeamSchedule([])
        return
    }

    setTeamSchedule(schedule)
  }

  const getMembers = async () => {
    console.log("Get members called")
    if (teamID === "") {
      setTeamMembers([])
      return
    }
    
    const resp = await fetch(api.base + api.handlers.teams + "/" + teamID + "/members", {
        headers: new Headers({ "Authorization": auth.authToken }) })

    if (resp.status !== 200) {
        if (resp.status === 404) {
            return
        }
        console.log(resp.body)
        return 
    }

    const members = await resp.json()
    setTeamMembers(members)
  }

  const postTeamMember = async (email) => {
    console.log("POST new member called")
    if (email === "") {
      return
    }

    const resp = await fetch(api.base + api.handlers.teams + "/" + teamID + "/members", {
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

    getMembers()
    getSchedule()
  }

  useEffect(() => {(async () => {
    getSchedule()
    getMembers()
  })() }, [teamID])

  return { teams, teamID, teamSchedule, teamMembers, getTeams, postTeam, postTeamMember, setTeamID }
}