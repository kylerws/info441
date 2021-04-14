import React, { Component, useState, useEffect } from 'react'
import { Form } from 'react-bootstrap'
import { useTeam } from '../../../hooks/useTeam'

export const CustomSelect = ({ defaultOption, options, update, ...rest }) => {
  const [selected, setSelected] = useState(defaultOption)

  useEffect(() => {
    update(selected)
  }, [])

  const handleChange = (e) => {
    e.preventDefault()
    setSelected(e.target.value)
    update(e.target.value)
  }

  const optionDivs = options.map(o => (
    <option key={o.value} value={o.value}>{o.label}</option>))
  
  return (
    <Form.Control {...rest} as="select" default={defaultOption}
      value={selected} onChange={e => handleChange(e)}>{optionDivs}</Form.Control>
  )
}

// Default select options
const defaultTeamID = ""
const defaultTeamOption = [{ label: "Select a team", value: defaultTeamID }]

// Select input for teams
export function TeamSelect({...rest}) {
  let teamCtx = useTeam()
  let [options, setOptions] = useState(defaultTeamOption)

  const { teams, setTeamID } = teamCtx

  useEffect(() => {
    teamCtx.getTeams()
  }, [])

  // Update options on teamState change
  useEffect(() => {
    if (!teams) return
    const newOptions = teams
        .map(d => { return { label: d.teamName, value: d.id, desc: d.desc } })
    newOptions.unshift(defaultTeamOption[0])
    setOptions(newOptions)
  }, [teams]) // run only if teams changes

  return (
    <CustomSelect {...rest}
      defaultOption={defaultTeamID}
      options={options}
      update={setTeamID} />)
}