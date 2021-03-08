package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"info441/servers/gateway/models/users"
	"info441/servers/gateway/sessions"
)

// UsersHandler comment
func (ctx *HandlerContext) UsersHandler(w http.ResponseWriter, r *http.Request) {

	// Only accept POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Force JSON
	contentHeader := r.Header.Get("Content-Type")
	if !strings.HasPrefix(contentHeader, "application/json") {
		http.Error(w, "Content Type Not Supported", http.StatusUnsupportedMediaType)
		return
	}

	// Create new user
	newUser := &users.NewUser{}

	// convert json to a byte array
	body, err := ioutil.ReadAll(r.Body)

	// unmarshal json to fill in newUser struct
	json.Unmarshal([]byte(body), newUser)
	if err != nil {
		log.Printf("Error unmarshaling json: %v\n", err)
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Convert new user to a user
	user := &users.User{}
	user, err = newUser.ToUser()
	if err != nil {
		log.Printf("Error creating user")
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// insert the user into the database
	insertedUser, err := ctx.UserStore.Insert(user)
	if err != nil {
		log.Printf("Failed to insert")
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// begin a new session for the user
	_, err = sessions.BeginSession(ctx.SigningKey, ctx.SessionStore, &SessionState{time.Now(), *insertedUser}, w)
	if err != nil {
		log.Printf("Error beginning session")
		return
	}

	// Write response to client
	w.Header().Set("Content-Type", "application/json")

	// write http status created
	w.WriteHeader(http.StatusCreated)

	// copy of user's profile in the response body, encoded as a json object
	userJSON, _ := json.Marshal(insertedUser)
	w.Write([]byte(userJSON))

	log.Printf("Created new user at %s", time.Now())
}

// SpecificUsersHandler handles the path /v1/users/{UserID}, checks if the current user is
// authenticated, and gets or updates user data based on the request.
func (ctx *HandlerContext) SpecificUsersHandler(w http.ResponseWriter, r *http.Request) {
	// Pointer to store state data
	state := &SessionState{}

	// Check authorization and request state from store
	_, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, state)

	if err != nil {
		switch err {
		case sessions.ErrInvalidID:
			// Session key did not match => http.StatusUnauthorized
			http.Error(w, "User not authenticated", http.StatusUnauthorized)
		case sessions.ErrInvalidScheme:
			// Wrong scheme, did not match bearer
			http.Error(w, "Authorization scheme incorrectly formatted", http.StatusBadRequest)
		default:
			// Case: decode error, write error, store.Get() error
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}

	switch r.Method {
	case http.MethodGet:
		// Get user ID from path
		pathBase := filepath.Base(r.URL.Path)

		// Parse user ID
		var userID int64
		if pathBase == "me" {
			userID = state.User.ID
		} else {
			userID, _ = strconv.ParseInt(pathBase, 10, 64)
		}

		// Get user by user ID
		user, err := ctx.UserStore.GetByID(userID)

		// If not user, respond with 404 status not found
		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		// Response
		w.Header().Set("Content-Type", "application/json")      // content type JSON
		w.WriteHeader(http.StatusOK)                            // response code
		if err := json.NewEncoder(w).Encode(user); err != nil { // try encode
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	case http.MethodPatch:
		// Get user ID from path
		pathBase := filepath.Base(r.URL.Path)

		// If path base is not me or
		if pathBase != "me" {
			// If user ID is not the current user
			if userID, _ := strconv.ParseInt(pathBase, 10, 64); userID != state.User.ID {
				http.Error(w, "Not authorized to update requested user", http.StatusForbidden)
				return
			}
		}

		// If content type is not JSON
		if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
			http.Error(w, "Request body must be in JSON", http.StatusUnsupportedMediaType)
			return
		}

		// Decode request JSON
		update := &users.Updates{}
		json.NewDecoder(r.Body).Decode(update)

		// Update user
		updatedUser, err := ctx.UserStore.Update(state.User.ID, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Write Response
		w.Header().Set("Content-Type", "application/json")             // content type JSON
		w.WriteHeader(http.StatusOK)                                   // response code
		if err := json.NewEncoder(w).Encode(updatedUser); err != nil { // try encode
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	default:
		http.Error(w, "Method is not allowed", http.StatusMethodNotAllowed)
	}
}

// SessionsHandler djnksnjfijfdj
func (ctx *HandlerContext) SessionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		http.Error(w, fmt.Sprintf(""), http.StatusUnsupportedMediaType)
		return
	}

	credentials := &users.Credentials{}
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		log.Print("error reading request body")
	}
	json.Unmarshal([]byte(body), credentials)

	user, err := ctx.UserStore.GetByEmail(credentials.Email)
	if err != nil {
		// pause to extend runtime in case user is not found
		time.Sleep(2 * time.Second)
		log.Printf("Incorrect credentials")
		http.Error(w, "Unauthorized credentials", http.StatusUnauthorized)
		return
	}

	err = user.Authenticate(credentials.Password)

	if err != nil {
		// pause to extend runtime in case user is not found
		log.Printf("Incorrect credentials")
		http.Error(w, "Unauthorized credentials", http.StatusUnauthorized)
		return
	}

	// If there is not an error thrown, create a log of the login
	IPAddress := r.RemoteAddr
	if len(IPAddress) == 0 {
		IPAddress = r.Header.Get("X-Forwarded-For")
	}
	// Get user ID
	err = ctx.UserStore.TrackLogin(user.ID, IPAddress)

	// Begin Session
	_, err = sessions.BeginSession(ctx.SigningKey, ctx.SessionStore, &SessionState{time.Now(), *user}, w)
	if err != nil {
		log.Printf("Error beginning session")
		return
	}

	// Set content type JSON
	w.Header().Set("Content-Type", "application/json")

	// write http status created
	w.WriteHeader(http.StatusCreated)

	// copy of user's profile in the response body, encoded as a json object
	userJSON, _ := json.Marshal(user)
	w.Write([]byte(userJSON))
}

// SpecificSessionsHandler handles the path v1/sessions/mine
func (ctx *HandlerContext) SpecificSessionsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodDelete:
		// If path end does not equal "mine"
		if pathBase := filepath.Base(r.URL.Path); pathBase != "mine" {
			http.Error(w, "Cannot delete another user's session", http.StatusForbidden)
			return
		}

		// End current session
		sessions.EndSession(r, ctx.SigningKey, ctx.SessionStore)

		// Write response
		w.WriteHeader(http.StatusNoContent)
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte("signed out"))

	default:
		http.Error(w, "Method is not allowed", http.StatusMethodNotAllowed)
	}
}
