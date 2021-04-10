import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth'

import { Form, Button, Row, Col } from 'react-bootstrap'

const UpdateName = () => {
    let auth = useAuth()
    const [firstName, setFirstName] = useState(auth.user.firstName)
    const [lastName, setLastName] = useState(auth.user.lastName)

    const submit = (e) => {
        e.preventDefault();
        auth.updateName(firstName, lastName)
    }

    return <>
        <Row className="mb-3 mt-lg-3 mb-lg-4 align-items-center">
            <Col xs={"auto"} sm={3} lg={3} className="d-flex justify-content-start justify-content-lg-center align-items-center">
                    <img src={auth.user.photoURL} style={{}} alt="profile"/>
            </Col>
            <Col>
                <h1>{auth.user.firstName + " " + auth.user.lastName}</h1>
                <h2>{auth.user.userName}</h2>
            </Col>
        </Row>
        <Form onSubmit={e => submit(e)}>
            <Form.Row className="ml-lg-2">
            <Form.Label column="lg">Edit Profile</Form.Label>
            </Form.Row>
            <Form.Group as={Row} className="ml-lg-3 mr-lg-5">
                <Form.Label column sm={3}>First Name</Form.Label>
                <Col>
                    <Form.Control placeholder="Enter new first name" type="text"
                        name={"firstName"} value={firstName} onChange={e => setFirstName(e.target.value)} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="ml-lg-3 mr-lg-5">
                <Form.Label column sm={3}>Last Name</Form.Label>
                <Col>
                    <Form.Control placeholder="Enter new last name" type="text"
                        name={"lastName"} value={lastName} onChange={e => setLastName(e.target.value)} />
                </Col>
            </Form.Group>
            <Form.Row className="justify-content-end mr-lg-5">
                <Button type="submit" size="sm" variant="success" className="mr-1 mr-lg-3">Save Changes</Button>
            </Form.Row>
        </Form>
    </>
}

export default UpdateName;