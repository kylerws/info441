import React, { Component, useState, useEffect } from 'react'
import { Form } from 'react-bootstrap'
import { useTeam } from '../../../hooks/useTeam'

export class CustomSelect extends Component {
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

// Default select options
const defaultTeamID = ""
const defaultTeamOption = [{ label: "Select a team", value: defaultTeamID }]

// Select input for teams
export function TeamSelect() {
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
    <CustomSelect
      default={defaultTeamID}
      options={options}
      update={setTeamID} />)
}