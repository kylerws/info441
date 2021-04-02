import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Row } from 'react-bootstrap';
import api from '../../../constants/APIEndpoints';
import Errors from '../../Errors/Errors';
import PageTypes from '../../../constants/PageTypes';

/**
 * @class
 * @classdesc SignIn handles the sign in component
 */
export default class SignIn extends Component {
    static propTypes = {
        setPage: PropTypes.func,
        setAuthToken: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            error: ""
        };

        this.fields = [
            {
                name: "Email",
                key: "email"
            },
            {
                name: "Password",
                key: "password"
            }];
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
        console.log("Submit init")
        const { email, password } = this.state;
        const sendData = { email, password };

        const response = await fetch(api.base + api.handlers.sessions, {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: new Headers({
                "Content-Type": "application/json"
            })
        });
        console.log("fetched")
        
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }

        console.log("no error")
        
        // Store auth token in local storage and App state
        const authToken = response.headers.get("Authorization")
        localStorage.setItem("Authorization", authToken);
        this.setError("");
        this.props.setAuthToken(authToken);

        // Set user
        const user = await response.json()
        localStorage.setItem("user", user)
        this.props.setUser(user)
    }

    render() {
        const values = this.state;
        const { error } = this.state;
        return <>
            <h2 className="text-center mb-4">Welcome Back!</h2>
            <Errors error={error} setError={this.setError} />
            <SignInForm
                setField={this.setField}
                submitForm={(e) => this.submitForm(e)}
                values={values} />
            <Row className="justify-content-center align-items-baseline mt-2">
                <Col xs={12} sm={6}>
                    <p className="text-center text-sm-right">Don't have an account with us?</p></Col>
                <Col xs={12} sm={6}><Row className="justify-content-center justify-content-sm-start">
                    <Button onClick={() => this.props.setPage(PageTypes.signUp)}
                        variant="warning" className="mr-3 mx-sm-3">Sign Up</Button>
                    <Button onClick={() => this.props.setPage(PageTypes.landing)}
                        variant="dark">Cancel</Button></Row></Col>
            </Row>
        </>
    }
}

// Form for sign in
const SignInForm = ({ setField, submitForm, values }) => {
    return <>
        <Form onSubmit={submitForm}>
            <Form.Row className="justify-content-center">
                <Form.Group as={Col} md={8} lg={6}>
                    <Form.Row><Col xs={12} sm={6}>
                        <Form.Control value={values["email"]} name="email" placeholder="Email"
                            onChange={setField} type="email" />
                    </Col><Col xs={12} sm={6}>
                        <Form.Control value={values["password"]} name="password" placeholder="Password"
                            onChange={setField} type="password" />
                    </Col></Form.Row>
                    </Form.Group>
                </Form.Row><Form.Row className="justify-content-center">
                <Form.Group as={Col} md={8} lg={6}><Form.Row className="justify-content-center mx-1 d-flex">
                    <Button type="submit" variant="light" className="w-100">Sign in</Button>
                </Form.Row></Form.Group>
            </Form.Row>
           
        </Form>
    </>
}