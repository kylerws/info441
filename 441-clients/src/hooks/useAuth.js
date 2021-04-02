import React, { useState, useEffect, useContext, createContext } from 'react'
import api from '../constants/APIEndpoints'

// creds
// const auth = {
//   isAuthenticated: false,
//   signin(cb) {
//     auth.isAuthenticated = true;
//     setTimeout(cb, 100); // fake async
//   },
//   signout(cb) {
//     auth.isAuthenticated = false;
//     setTimeout(cb, 100);
//   }
// };

// Auth context
const authContext = createContext();

// Provider component that wraps app and makes auth object
export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object
export const useAuth = () => {
  return useContext(authContext);
}

// Provider hook that creates auth object and handles state
// Wraps all auth methods
function useProvideAuth() {
  const [authToken, setAuthToken] = useState(null)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  
  // Wrap auth methods
  const signin = (email, password) => {
    const sendData = { email, password }
    let options = {
      method: "POST",
      body: JSON.stringify(sendData),
      headers: new Headers({
          "Content-Type": "application/json"
      })
    }

    // Start session
    await fetch(api.base + api.handlers.sessions, options).then(resp => {
        if(resp.status >= 300) {
          await resp.text()
            .then(errorText => setError(errorText))
            .then(errorText => {throw new Error("Bad response from server: " + errorText)})
        }
        return resp
      }).then(resp => {
        setAuthToken(resp.headers.get("Authorization"))
        return resp
      })
      .then(resp => resp.json())            // get JSON object
      .then(user => setUser(user))          // set user
      .catch(error => console.log(error))   // catch errors
  };

  const signup = (email, password) => {
    // return firebase
    //   .auth()
    //   .createUserWithEmailAndPassword(email, password)
    //   .then(response => {
    //     setUser(response.user);
    //     return response.user;
    //   });
  };

  const signout = () => {
    // return firebase
    //   .auth()
    //   .signOut()
    //   .then(() => {
    //     setUser(false);
    //   });
  };

  return {
    authToken,
    user,
    error,
    signin,
    signup,
    signout
  }
}