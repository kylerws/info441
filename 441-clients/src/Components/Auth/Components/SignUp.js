import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Row } from 'react-bootstrap'
import Errors from '../../Errors/Errors';
import PageTypes from '../../../constants/PageTypes';

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
    const { email, userName, firstName, lastName, password, passwordConf } = this.state
    this.props.signUp({ email, userName, firstName, lastName, password, passwordConf })
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