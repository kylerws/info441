import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap'
import api from '../../../../Constants/APIEndpoints/APIEndpoints';
import Errors from '../../../Errors/Errors';

const SignOutButton = ({ setAuthToken, setUser }) => {
    const [error, setError] = useState("");

    return <><Button variant="danger" onClick={async (e) => {
        e.preventDefault();
        const response = await fetch(api.base + api.handlers.sessionsMine, {
            method: "DELETE"
        });
        if (response.status >= 300) {
            const error = await response.text();
            setError(error);
            return;
        }
        localStorage.removeItem("Authorization");
        setError("");
        setAuthToken("");
        setUser(null);
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
    setUser: PropTypes.func.isRequired
}

export default SignOutButton;