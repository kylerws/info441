import React, { useState, useEffect, useContext, createContext } from 'react'
import api from '../constants/APIEndpoints'

// Auth context
const authContext = createContext();

// Provider component that wraps app
export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components
export const useAuth = () => {
  return useContext(authContext);
}

// Provider hook that creates auth object, handles state, and wraps methods
function useProvideAuth() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken") || null)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  
  // Sign in user with credentials
  const signin = async (email, password) => {
    const options = {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: new Headers({
          "Content-Type": "application/json"
      })
    }

    await fetch(api.base + api.handlers.sessions, options)
      .then(async (resp) => {
        if(resp.status >= 300) {
          const errorText = await resp.text()
          setError(errorText)
          throw new Error("Bad response from server: " + errorText)
        }
        return resp
      }).then(resp => {
        const authToken = resp.headers.get("Authorization") // get auth token
        localStorage.setItem("authToken", authToken)        // save to local storage for page reload
        setAuthToken(authToken)                             // update auth hook state
        setError(null)                                      // clear errors
        return resp
      })
      // .then(resp => resp.json())        // get JSON object
      // .then(user => setUser(user))      // set user
      // .then(console.log("Signed in, got user"))
      .catch(e => console.log(e))       // catch errors
  };

  // Sign up new user
  const signup = async (newUser) => {
    const options = {
      method: "POST",
      body: JSON.stringify(newUser),
      headers: new Headers({
          "Content-Type": "application/json"
      })
    }

    await fetch(api.base + api.handlers.users, options)
      .then(resp => {
        if(resp.status >= 300) {
          const errorText = resp.text()
          setError(errorText)
          throw new Error("Bad response from server: " + errorText)
        }
        return resp 
      }).then(resp => {
        const authToken = resp.headers.get("Authorization") // get auth token
        localStorage.setItem("authToken", authToken)        // save to local storage for page reload
        setAuthToken(authToken)                             // update auth hook state
        setError(null)                                      // clear errors
        return resp 
      }).catch(e => console.log(e))
  };

  // Sign out the current user
  const signout = async () => {
    await fetch(api.base + api.handlers.sessionsMine, {
      method: "DELETE"
    }).then(resp => {
      if(resp.status >= 300) {
        const errorText = resp.text()
        setError(errorText)
        throw new Error("Bad response from server: " + errorText)
      }
    })
    .then(localStorage.removeItem("authToken"))
    .then(setAuthToken(null))
    .then(setUser(null))
    .then(setError(null))
    .catch(e => console.log(e))
  };

  const updateName = async (firstName, lastName) => {
    const response = await fetch(api.base + api.handlers.myuser, {
      method: "PATCH",
      body: JSON.stringify({firstName, lastName}),
      headers: new Headers({
          "Authorization": authToken,
          "Content-Type": "application/json"
      })
    });
    if (response.status >= 300) {
        const error = await response.text();
        console.log(error);
        return;
    }
    console.log("Name changed")
    const user = await response.json();
    setUser(user)
  }

  // Get current user on page reload or authToken change
  useEffect(() => {(async () => {
    // If no auth or we already have a user, do not run
    if (!authToken || user !== null) {
      console.log("No auth or we have user")
      return
    }

    console.log("Fetching current user")
    await fetch(api.base + api.handlers.myuser, {
        headers: new Headers({
            "Authorization": authToken
        })
    }).then(resp => {
      if(resp.status >= 300) {
        // If no user, remove auth and user
        setAuthToken(null)
        setUser(null)
        throw new Error("Unable to verify login. Logging out...")
      }
      return resp
    })
    .then(resp => resp.json())
    .then(user => setUser(user))
    .catch(e => console.log(e))
  })() }, [authToken]);  // only run if authToken changes

  return {
    authToken, user, error,
    signin, signup, signout, updateName
  }
}