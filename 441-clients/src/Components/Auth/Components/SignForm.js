import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form } from 'react-bootstrap'

const SignForm = ({ setField, submitForm, values, fields }) => {
    return <>
        <Form onSubmit={submitForm}>
            <Form.Row className="justify-content-center">
            {fields.map(d => {
                const { key, name } = d;
                return <Form.Group as={Col} key={key}>
                    <Form.Label>{name}: </Form.Label>
                    <Form.Control
                        value={values[key]}
                        name={key}
                        onChange={setField}
                        type={key === "password" || key === "passwordConf" ? "password" : 
                            key === "email" ? "email" : "text"}
                    />
                </Form.Group>
            })}
            <Form.Group as={Col} className="d-flex align-items-end">
                <Button type="submit" variant="light">Go</Button>
            </Form.Group>

            </Form.Row>
        </Form>
    </>
}

SignForm.propTypes = {
    setField: PropTypes.func.isRequired,
    submitForm: PropTypes.func.isRequired,
    values: PropTypes.shape({
        email: PropTypes.string.isRequired,
        userName: PropTypes.string,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        password: PropTypes.string.isRequired,
        passwordConf: PropTypes.string
    }),
    fields: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        name: PropTypes.string
    }))
}

export default SignForm;