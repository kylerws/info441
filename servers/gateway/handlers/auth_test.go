package handlers

import (
	"assignments-fixed-kylerws/servers/gateway/models/users"
	"assignments-fixed-kylerws/servers/gateway/sessions"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strconv"
	"strings"
	"testing"
	"time"
)

const testKey = "test signing key"

func TestUsersHandler(t *testing.T) {
	// Declare stores and context handler
	sessionStore := sessions.NewMemStore(10000, 100)
	userStore := NewMockUserDB()
	ctx := &HandlerContext{
		testKey,
		sessionStore,
		userStore,
	}

	// Handler function to test
	handlerToTest := ctx.UsersHandler

	newUser := &users.NewUser{
		Email:        "user1@test.com",
		Password:     "password",
		PasswordConf: "password",
		UserName:     "user1",
		FirstName:    "first",
		LastName:     "last",
	}

	expectedUser := &users.User{
		ID:        1,
		UserName:  newUser.UserName,
		FirstName: newUser.FirstName,
		LastName:  newUser.LastName,
		PhotoURL:  "https://www.gravatar.com/avatar/eb7c8c7791f4f4c7cdd712635277a1f2",
	}

	cases := []struct {
		name        string
		methodType  string
		statusCode  int
		contentType string
		requestBody interface{}
		expectError bool
	}{
		{
			"Basic case",
			"POST",
			http.StatusCreated,
			"application/json",
			newUser,
			false,
		},
		{
			"Method other than POST",
			"GET",
			http.StatusMethodNotAllowed,
			"application/json",
			nil,
			true,
		},
		{
			"Content type not JSON",
			"POST",
			http.StatusBadRequest,
			"",
			nil,
			true,
		},
		{
			"Bad request body",
			"POST",
			http.StatusBadRequest,
			"application/json",
			newTestUser(1),
			true,
		},
	}

	// Test cases here
	for _, c := range cases {
		// Log case name
		t.Logf("Case: [%s]", c.name)

		// New request
		req, err := http.NewRequest(c.methodType, "v1/users", toBytesBuffer(c.requestBody))
		if err != nil {
			t.Fatal(err)
		}

		// Set request content type
		req.Header.Set("Content-Type", c.contentType)

		// Serve request
		rr := httptest.NewRecorder()               // new http recorder
		handler := http.HandlerFunc(handlerToTest) // handler function
		handler.ServeHTTP(rr, req)                 // serve request

		// Get http response
		resp := rr.Result()

		// Check the status code
		checkStatusCode(t, resp, c.statusCode)

		// If we expect a valid response
		if !c.expectError {
			// Check content type
			checkContentType(t, resp, c.contentType)

			// Check the response body
			expUser := expectedUser                    // expected User
			respUser := &users.User{}                  // response body User
			json.NewDecoder(rr.Body).Decode(respUser)  // decode body
			if !reflect.DeepEqual(respUser, expUser) { // compare Users
				t.Errorf("Error: handler returned unexpected body\nGot: %v\nExpected:%v",
					respUser, expUser)
			}

			// Check that session was created
			state := &SessionState{} // hold state
			sid := strings.Replace(
				resp.Header.Get("Authorization"), "Bearer ", "", 1) // get sid from header
			err := ctx.SessionStore.Get(sessions.SessionID(sid), state) // get state
			if err != nil {                                             // if error getting state
				t.Errorf("Error: Could not get session\nDetails: %s", err.Error())
			}

			if reflect.DeepEqual(state, &SessionState{}) { // if state is empty
				t.Errorf("Error: Empty session state")
			}
		}
	}
}

func TestSpecificUsersHandler(t *testing.T) {
	// Declare stores and context handler
	sessionStore := sessions.NewMemStore(10000, 1000)
	userStore := NewMockUserDB()
	ctx := &HandlerContext{
		testKey,
		sessionStore,
		userStore,
	}

	// Handler function to test
	handlerToTest := ctx.SpecificUsersHandler

	// Set up user store
	insertedUsers := insertTestUsers(userStore, 10)

	// Cases to test
	cases := []struct {
		name               string
		methodType         string
		requestPath        string
		expectedStatusCode int
		expectedUserID     int
		requestBody        *users.Updates
		expectError        bool
	}{
		{
			"GET: v1/users/me",
			"GET",
			"v1/users/me",
			http.StatusOK,
			1,
			nil,
			false,
		},
		{
			"Basic get user example",
			"GET",
			"v1/users/1",
			http.StatusOK,
			1,
			nil,
			false,
		},
		{
			"Get badly formatted user id",
			"GET",
			"v1/users/123adfasdfjkfsadf",
			http.StatusNotFound,
			-1,
			nil,
			true,
		},
		{
			"Get userID of non-existent user",
			"GET",
			"v1/users/20",
			http.StatusNotFound,
			-1,
			nil,
			true,
		},
		{
			"Patch with path v1/users/me",
			"PATCH",
			"v1/users/me",
			http.StatusOK,
			1,
			&users.Updates{FirstName: "New", LastName: "Name"},
			false,
		},
		{
			"Patch with id of the current user",
			"PATCH",
			"v1/users/1",
			http.StatusOK,
			1,
			&users.Updates{FirstName: "Another", LastName: "Name"},
			false,
		},
		{
			"Patch when userID is not the current user",
			"PATCH",
			"v1/users/10",
			http.StatusForbidden,
			-1,
			&users.Updates{FirstName: "-", LastName: "-"},
			true,
		},
		{
			"PATCH: userID is not a number",
			"PATCH",
			"v1/users/fasdklfdsajf",
			http.StatusForbidden,
			-1,
			&users.Updates{FirstName: "-", LastName: "-"},
			true,
		},
		{
			"PATCH: userID of non-existant user",
			"PATCH",
			"v1/users/20",
			http.StatusForbidden,
			-1,
			&users.Updates{FirstName: "-", LastName: "-"},
			true,
		},
	}

	// Test cases
	for _, c := range cases {
		// Log case name
		t.Logf("Testing case: [%s]", c.name)

		// Create authorized request
		req := newRequestWithAuth(t, ctx, insertedUsers[0], c.methodType, c.requestPath, c.requestBody)

		// Set content type if patch
		if c.methodType == "PATCH" {
			req.Header.Set("Content-Type", "application/json")
		}

		// Serve request
		rr := httptest.NewRecorder()               // new http recorder
		handler := http.HandlerFunc(handlerToTest) // handler function
		handler.ServeHTTP(rr, req)                 // serve request

		// Check the status code
		checkStatusCode(t, rr.Result(), c.expectedStatusCode)

		// Check response body if we expect valid response
		if !c.expectError {
			expUser := insertedUsers[c.expectedUserID-1] // expected User
			respUser := &users.User{}                    // response body User
			json.NewDecoder(rr.Body).Decode(respUser)    // decode body
			if !reflect.DeepEqual(respUser, expUser) {   // compare Users
				t.Errorf("Error: handler returned unexpected body\nGot: %v\nExpected:%v",
					respUser, expUser)
			}
		}
	}

	// Edge cases
	edgeCases := []struct {
		name         string
		methodType   string
		requestPath  string
		isAuthorized bool
		authHeader   string
		statusCode   int
		requestBody  *users.Updates
	}{
		{
			"Test get with no session",
			"GET",
			"v1/users/1",
			false,
			"Bearer ",
			http.StatusUnauthorized,
			nil,
		},
		{
			"Test unauthorized method",
			"POST",
			"v1/users/1",
			true,
			"Bearer ",
			http.StatusMethodNotAllowed,
			nil,
		},
		{
			"Test patch with no session",
			"PATCH",
			"v1/users/1",
			false,
			"Bearer ",
			http.StatusUnauthorized,
			nil,
		},
		{
			"Test incorrect auth format",
			"PATCH",
			"v1/users/1",
			false,
			"dsfakslfaf",
			http.StatusBadRequest,
			nil,
		},
		{
			"Test patch no JSON",
			"PATCH",
			"v1/users/1",
			true,
			"Bearer ",
			http.StatusUnsupportedMediaType,
			nil,
		},
	}

	for _, c := range edgeCases {
		t.Logf("%s", c.name)

		sessionID := ""

		if c.isAuthorized {
			newSessionID, _ := newMockSession(t, ctx, insertedUsers[0])
			sessionID = string(newSessionID)
		} else {
			newSessionID, _ := sessions.NewSessionID("incorrect signing key")
			sessionID = string(newSessionID)
		}

		// New Request
		req, err := http.NewRequest(c.methodType, c.requestPath, toBytesBuffer(c.requestBody))
		if err != nil {
			t.Fatal(err)
		}

		// Set authorization
		req.Header.Set("Authorization", c.authHeader+string(sessionID))

		// Serve request
		rr := httptest.NewRecorder()               // new http recorder
		handler := http.HandlerFunc(handlerToTest) // handler function
		handler.ServeHTTP(rr, req)                 // serve request

		// Check the status code
		checkStatusCode(t, rr.Result(), c.statusCode)
	}
}

func TestSessionsHandler(t *testing.T) {
	sessionStore := sessions.NewMemStore(10000, 1000)
	userStore := NewMockUserDB()
	ctx := &HandlerContext{
		testKey,
		sessionStore,
		userStore,
	}

	// Handler function to test
	handlerToTest := ctx.SessionsHandler

	// Set up user store

	// Insert fake user to test against
	mockNewUser := &users.NewUser{
		Email:        "test@test.com",
		Password:     "password",
		PasswordConf: "password",
		UserName:     "testUser",
		FirstName:    "test",
		LastName:     "tester",
	}

	mockUser, err := mockNewUser.ToUser()
	if err != nil {
		t.Log("Error converting new user to user")
		t.Errorf(err.Error())
	}

	userStore.Insert(mockUser)

	cases := []struct {
		name               string
		methodType         string
		contentType        string
		credentials        *users.Credentials
		expectedStatusCode int
		expectError        bool
	}{
		{
			"Correct Login",
			"POST",
			"application/json",
			&users.Credentials{
				Email:    "test@test.com",
				Password: "password",
			},
			http.StatusCreated,
			false,
		}, {
			"Incorrect Email",
			"POST",
			"application/json",
			&users.Credentials{
				Email:    "testt@test.com",
				Password: "password",
			},
			http.StatusUnauthorized,
			true,
		}, {
			"Incorrect Password",
			"POST",
			"application/json",
			&users.Credentials{
				Email:    "test@test.com",
				Password: "passincorrect",
			},
			http.StatusUnauthorized,
			true,
		},
	}

	// Test cases here
	for _, c := range cases {
		// get c.credentials
		requestBody, _ := json.Marshal(c.credentials)
		// marshal into json
		// create a new request
		// create request recorder
		request := httptest.NewRequest(c.methodType, "/v1/sessions", bytes.NewReader(requestBody))
		request.Header.Set("Content-Type", c.contentType)
		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(handlerToTest)

		handler.ServeHTTP(rr, request)

		// check if the http responses to see if correct errors were thrown
		// responseStatus := rr.Code
		// if responseStatus != c.expectedStatusCode {
		// 	t.Errorf(" Failed test %s, Expected response: %d, Actual Response: %d", c.name, c.expectedStatusCode, responseStatus)
		// } else {
		// 	log.Printf("Passed test %s", c.name)
		// }
		checkStatusCode(t, rr.Result(), c.expectedStatusCode)
	}
}

// func TestSessionsHandler(t *testing.T) {
// 	sessionStore := sessions.NewMemStore(10000, 1000)
// 	userStore := NewMockUserDB()
// 	ctx := &HandlerContext{
// 		testKey,
// 		sessionStore,
// 		userStore,
// 	}

// 	// Handler function to test
// 	handlerToTest := ctx.SpecificSessionsHandler

// 	// Set up user store
// 	insertedUsers := insertTestUsers(userStore, 10)

// 	// Success case
// 	//

// 	cases := []struct {
// 		name string
// 		// more params
// 		expectError bool
// 	}{
// 		{
// 			"Basic case",
// 			// more test pararms
// 			false,
// 		},
// 		// {
// 		// 	"",
// 		// },
// 	}

// 	// Test cases here
// 	for _, c := range cases {

// 	}
// }

func TestSpecificSessionsHandler(t *testing.T) {
	// Declare stores and context handler
	sessionStore := sessions.NewMemStore(10000, 1000)
	userStore := NewMockUserDB()
	ctx := &HandlerContext{
		testKey,
		sessionStore,
		userStore,
	}

	// Handler function to test
	handlerToTest := ctx.SpecificSessionsHandler

	// Set up user store
	insertedUsers := insertTestUsers(userStore, 10)

	// Alt session
	sidTest, _ := sessions.NewSessionID(ctx.SigningKey)

	// Cases
	cases := []struct {
		name             string
		methodType       string
		requestPath      string
		statusCode       int
		expectedBodyText string
		expectError      bool
	}{
		{
			"Successful session end",
			"DELETE",
			"v1/sessions/mine",
			http.StatusNoContent,
			"signed out",
			false,
		},
		{
			"Bad path ending",
			"DELETE",
			"v1/sessions/adfadsfasdfasdf",
			http.StatusForbidden,
			"",
			true,
		},
		{
			"Try to access another session",
			"DELETE",
			"v1/sessions/" + string(sidTest),
			http.StatusForbidden,
			"",
			true,
		},
		{
			"Unauthorized method",
			"GET",
			"v1/sessions/" + string(sidTest),
			http.StatusMethodNotAllowed,
			"",
			true,
		},
	}

	// Test cases here
	for _, c := range cases {
		// Log case name
		t.Logf("Testing case: [%s]", c.name)

		// New request
		req := newRequestWithAuth(t, ctx, insertedUsers[0], c.methodType, c.requestPath, nil)

		// Add other sessions
		sids := []sessions.SessionID{}
		for i, user := range insertedUsers {
			if i != 0 {
				sid, _ := newMockSession(t, ctx, user)
				sids = append(sids, sid)
			}
		}

		// Serve request
		rr := httptest.NewRecorder()               // new http recorder
		handler := http.HandlerFunc(handlerToTest) // handler function
		handler.ServeHTTP(rr, req)                 // serve request

		// Get http response
		resp := rr.Result()

		// Check the status code
		checkStatusCode(t, resp, c.statusCode)

		// If we expect valid response
		if !c.expectError {
			checkResponseBodyText(t, resp, c.expectedBodyText)

			// Check that session is ended
			state := &SessionState{} // hold state
			sid := strings.Replace(
				resp.Header.Get("Authorization"), "Bearer ", "", 1) // get sid from header
			err := ctx.SessionStore.Get(sessions.SessionID(sid), state) // get state

			// If no error or state is not empty
			if err == nil || !reflect.DeepEqual(state, &SessionState{}) { // if state is empty
				t.Errorf("Error: Session state was not deleted")
			}

			// Check that other sessions are still running
			for _, sid := range sids {
				state := &SessionState{}                                     // hold state
				err := ctx.SessionStore.Get(sid, state)                      // get state
				if err != nil || reflect.DeepEqual(state, &SessionState{}) { // if error getting state
					t.Logf("Error: Session [%v] interrupted\nDetails: %s", sid, err.Error())
				}
			}
		}
	}
}

///// Helper functions //////

// insertTestUsers inserts n tests users into the given MockUserStore
func insertTestUsers(store *MockUserStore, n int) []*users.User {
	var users []*users.User
	for i := 1; i <= n; i++ {
		testUser := newTestUser(i)                // new test user
		insertedUser, _ := store.Insert(testUser) // insert user into store
		insertedUser.Email = ""                   // email will never be return by JSON
		users = append(users, insertedUser)       // append
	}
	return users
}

func newTestUser(i int) *users.User {
	userName := "user" + strconv.Itoa(i)
	testUser := &users.User{
		Email:    userName + "@test.com",
		UserName: userName,
	}
	return testUser
}

// func printInsertedUsers(t *testing.T, users []*users.User) {
// 	for _, user := range users {
// 		t.Logf("%v", user)
// 	}
// }

// newRequestWithAuth creates a new authenticated session and request
// Returns new http request with authentication
func newRequestWithAuth(t *testing.T, ctx *HandlerContext, sessionUser *users.User,
	method string, path string, body interface{}) *http.Request {
	// New Session
	sid, _ := newMockSession(t, ctx, sessionUser)

	// Create request
	req, err := http.NewRequest(method, path, toBytesBuffer(body))
	if err != nil {
		t.Fatal(err)
	}

	// Set auth
	req.Header.Set("Authorization", "Bearer "+string(sid))

	return req
}

// newMockSession creates a new session for the given user
func newMockSession(t *testing.T, ctx *HandlerContext, user *users.User) (sessions.SessionID, *SessionState) {
	// New session ID
	newSessionID, sessionErr := sessions.NewSessionID(ctx.SigningKey)
	if sessionErr != nil {
		t.Fatal(sessionErr.Error())
	}

	// Save new SessionState to the store
	state := &SessionState{time.Now(), *user}
	if saveErr := ctx.SessionStore.Save(newSessionID, state); saveErr != nil {
		t.Fatal(saveErr.Error())
	}

	return newSessionID, state
}

// toBytesBuffer allows any struct to be put into a request body
// returns marshaled JSON as a bytes Buffer
func toBytesBuffer(anyStruct interface{}) *bytes.Buffer {
	body, _ := json.Marshal(anyStruct)
	return bytes.NewBuffer(body)
}

func checkStatusCode(t *testing.T, resp *http.Response, expected int) {
	if status := resp.StatusCode; status != expected {
		t.Errorf("Error: handler returned wrong status code\nGot: %v\nExpected: %v",
			status, expected)
	}
}

func checkContentType(t *testing.T, resp *http.Response, expected string) {
	if contentType := resp.Header.Get("Content-Type"); contentType != expected {
		t.Errorf("Error: response had wrong content type\nGot: %v\nExpected: %v",
			contentType, expected)
	}
}

func checkResponseBodyText(t *testing.T, resp *http.Response, expected string) {
	body, _ := ioutil.ReadAll(resp.Body)               // read response body
	bodyText := strings.TrimSuffix(string(body), "\n") // format to string
	if bodyText != expected {
		t.Errorf("Error: handler returned unexpected body\nGot: %v\nExpected: %v",
			bodyText, expected)
	}
}

// func checkResponseBodyStruct(t *testing.T, body *bytes.Buffer, expected interface{}) {
// 	// expUser := expectedUser                    // expected User
// 	respUser := &users.User{}                  // response body User
// 	json.NewDecoder(body).Decode(respUser)  // decode body
// 	if !reflect.DeepEqual(respUser, expected) { // compare Users
// 		t.Errorf("Error: handler returned unexpected body\nGot: %v\nExpected:%v",
// 			respUser, expected)
// 	})
// }

func insertNewUser(user *users.NewUser, ctx *HandlerContext, rr *httptest.ResponseRecorder) {
	// Given a new user
	mockRequest, _ := http.NewRequest("POST", "/v1/users", toBytesBuffer(user))
	handler := http.HandlerFunc(ctx.UsersHandler)
	handler.ServeHTTP(rr, mockRequest)
	if status := rr.Code; status != http.StatusOK {
		fmt.Errorf("registration failed")
	}
}
