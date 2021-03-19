import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Row } from 'react-bootstrap'
import SignForm from './SignForm';
import api from '../../../Constants/APIEndpoints/APIEndpoints';
import Errors from '../../Errors/Errors';
import PageTypes from '../../../Constants/PageTypes/PageTypes';

/**
 * @class
 * @classdesc SignUp handles the sign up component
 */
class SignUp extends Component {
    static propTypes = {
        setPage: PropTypes.func,
        setAuthToken: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            userName: "",
            firstName: "",
            lastName: "",
            password: "",
            passwordConf: "",
            error: ""
        };

    }

    /**
     * @description setField will set the field for the provided argument
     */
    setField = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    /**
     * @description setError sets the error message
     */
    setError = (error) => {
        this.setState({ error })
    }

    /**
     * @description submitForm handles the form submission
     */
    submitForm = async (e) => {
        e.preventDefault();
        const { email,
            userName,
            firstName,
            lastName,
            password,
            passwordConf } = this.state;
        const sendData = {
            email,
            userName,
            firstName,
            lastName,
            password,
            passwordConf
        };
        const response = await fetch(api.base + api.handlers.users, {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: new Headers({
                "Content-Type": "application/json"
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        const authToken = response.headers.get("Authorization")
        localStorage.setItem("Authorization", authToken);
        this.setError("");
        this.props.setAuthToken(authToken);
        const user = await response.json();
        this.props.setUser(user);
    }

    render() {
        const values = this.state;
        const { error } = this.state;
        return <>
            <Errors error={error} setError={this.setError} />
            <SignUpForm
                setField={this.setField}
                submitForm={this.submitForm}
                values={values} />
            <Row className="justify-content-center align-items-baseline mt-2">
                <Col xs={12} sm={6}>
                    <p className="text-center text-sm-right">Have an account already?</p></Col>
                <Col xs={12} sm={6}><Row className="justify-content-center justify-content-sm-start">
                    <Button onClick={() => this.props.setPage(PageTypes.signIn)}
                        variant="info" className="mr-3 mx-sm-3">Sign In</Button>
                    <Button onClick={() => this.props.setPage(PageTypes.landing)}
                        variant="dark">Cancel</Button></Row></Col>
            </Row>
        </>
    }
}

const SignUpForm = ({ setField, submitForm, values }) => {
    return <>
        <Form onSubmit={submitForm}>
            <Form.Row className="justify-content-center">
                <Form.Group as={Col} md={8} lg={6}>
                    <Form.Label>Your Info</Form.Label>
                        <Form.Row><Col>
                            <Form.Control value={values["firstName"]} name="firstName" placeholder="First name"
                                onChange={setField} type="text" />
                            </Col><Col>
                            <Form.Control value={values["lastName"]} name="lastName" placeholder="Last name"
                                onChange={setField} type="text" />
                        </Col></Form.Row>
                </Form.Group>
            </Form.Row><Form.Row className="justify-content-center">
                <Form.Group as={Col} md={8} lg={6}>
                    {/* <Form.Label>Email</Form.Label> */}
                    <Form.Control value={values["email"]} name="email" placeholder="Email"
                        onChange={setField} type="email" />
                    {/* <Form.Label className="mt-2">Username</Form.Label> */}
                    <Form.Control value={values["userName"]} name="userName" placeholder="Username"
                        onChange={setField} type="text" className="mt-3" />
                </Form.Group>
            </Form.Row><Form.Row className="justify-content-center">
                <Form.Group as={Col} md={8} lg={6}>
                    <Form.Label>Password</Form.Label>
                        <Form.Row><Col>
                            <Form.Control value={values["password"]} name="password" placeholder="Enter password"
                                onChange={setField} type="password" />
                            </Col><Col>
                            <Form.Control value={values["passwordConf"]} name="passwordConf" placeholder="Confirm password"
                                onChange={setField} type="password" />
                        </Col></Form.Row>
                </Form.Group>
            </Form.Row><Form.Row className="justify-content-center">
                <Form.Group as={Col} md={8} lg={6}><Form.Row className="justify-content-center mx-1 d-flex">
                    <Button type="submit" variant="light" className="w-100">Create account</Button>
                </Form.Row></Form.Group>
            </Form.Row>
        </Form>
    </>
}

export default SignUp;