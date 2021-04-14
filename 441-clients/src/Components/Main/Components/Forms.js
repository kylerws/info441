import React, { useState } from 'react'
import { useTeam } from '../../../hooks/useTeam'
// import { CustomSelect } from './Inputs'
import { Form, Col, Button } from 'react-bootstrap'

// export const DayForm = ({submit, setDay, setStart, setEnd}) => {
//   return (
//     <Form onSubmit={submit}>
//       <Form.Row className="justify-content-center justify-content-lg-end">
//         <Form.Group as={Col} xs={12} sm={5}>
//           <Form.Label>Day to Add</Form.Label>
//           <CustomSelect options={dayOptions} default={"sunday"} update={(v) => setDay(v)}/>
//         </Form.Group>
//         <Form.Group as={Col} xs={6} sm={2}>
//           <Form.Label>Start Time</Form.Label>
//         <CustomSelect options={hourOptions} default={9} update={(v) => setStart(v)}/>
//         </Form.Group>
//         <Form.Group as={Col} xs={6} sm={2}>
//           <Form.Label>End Time</Form.Label>
//           <CustomSelect options={hourOptions} default={17} update={(v) => setEnd(v)}/>
//         </Form.Group>    
//         <Form.Group as={Col} xs={12} sm={"auto"} className="align-self-end">
//           <Button type="submit" variant="outline-success">Add</Button>
//         </Form.Group>
//         </Form.Row>
//     </Form>
//   )
// }

export const TeamForm = () => {
  let teamCtx = useTeam()
  let [name, setName] = useState("")
  let [desc, setDesc] = useState("")

  const submit = e => {
    e.preventDefault()
    teamCtx.postTeam(name, desc)
  }

  return(
    <Form onSubmit={submit}>
      <Form.Row>
        <Form.Group as={Col} xs={12} sm={6} md={5} lg={4} xl={3}>
          <Form.Label>Team Name</Form.Label>
          <Form.Control type="text" onChange={(e) => setName(e.target.value)}/>
        </Form.Group>
        <Form.Group as={Col} xs={12} sm={6} md={5} lg={4} xl={3}>
          <Form.Label>Description</Form.Label>
          <Form.Control type="text" onChange={(e) => setDesc(e.target.value)}/>
        </Form.Group>
        <Form.Group as={Col} xs={12} sm={"auto"} className="d-flex align-self-end">
            <Button type="submit" variant="success" className="flex-grow-1">Create</Button> 
        </Form.Group>
      </Form.Row>
    </Form>
  )
}

export const PostMemberForm = () => {
  let teamCtx = useTeam()
  let [member, setMember] = useState("")

  const submit = e => {
    e.preventDefault()
    teamCtx.postTeamMember(member)
    setMember("")
  }

  return (
    <Form onSubmit={submit}>
      <Form.Row>
        <Form.Group as={Col} xs={12} md={"auto"}>
          <Form.Control type="email" placeholder="name@example.com" size="sm" value={member}
            onChange={(e) => setMember(e.target.value)}/>
        </Form.Group>
        <Form.Group as={Col}>
          <Button type="submit" size="sm" variant="success">Add Member</Button>
        </Form.Group>             
      </Form.Row>
    </Form>
  )
}