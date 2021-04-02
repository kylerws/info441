import React, { useState } from 'react'
import PropTypes from 'prop-types'


import { Button } from 'react-bootstrap'
import api from '../../../../Constants/APIEndpoints';
import Errors from '../../../Errors/Errors';

const SignOutButton = ({ setAuthToken, setUser, signOut }) => {
    const [error, setError] = useState("");
    

    return <><Button variant="danger" onClick={async (e) => {
        e.preventDefault();
        console.log("clicked")
        const response = await fetch(api.base + api.handlers.sessionsMine, {
            method: "DELETE"
        });
        if (response.status >= 300) {
            const error = await response.text();
            setError(error);
            console.log("error sign out")
            return;
        }
        localStorage.removeItem("Authorization");
        setError("");
        setAuthToken("");
        setUser(null);
        signOut()

    }}>Sign out</Button>
        {error &&
            <div>
                <Errors error={error} setError={setError} />
            </div>
        }
    </>
}

SignOutButton.propTypes = {
    setAuthToken: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
}

export default SignOutButton;